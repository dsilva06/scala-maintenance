<?php

namespace Tests\Feature;

use App\Models\AiConversation;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_use_ai_endpoints(): void
    {
        $this->postJson('/api/ai/conversations')->assertUnauthorized();
        $this->postJson('/api/ai/conversations/1/messages')->assertUnauthorized();
    }

    public function test_user_can_create_conversation(): void
    {
        Sanctum::actingAs(User::factory()->create());

        Plan::create([
            'name' => 'Free',
            'slug' => 'free',
            'provider' => 'openai',
            'model' => 'gpt-4.1-mini',
            'monthly_message_limit' => 50,
        ]);

        $response = $this->postJson('/api/ai/conversations', [
            'title' => 'Plan de mantenimiento',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('ai_conversations', ['title' => 'Plan de mantenimiento']);
    }

    public function test_user_can_send_message_and_receives_stub_response(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $plan = Plan::create([
            'name' => 'Pro',
            'slug' => 'pro',
            'provider' => 'openai',
            'model' => 'gpt-4.1',
            'monthly_message_limit' => 500,
        ]);

        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'messages_used' => 0,
            'period_started_at' => now(),
            'period_ends_at' => now()->addMonth(),
        ]);

        config()->set('services.ai_agent.api_key', 'test-key');
        config()->set('services.ai_agent.base_url', 'https://api.openai.com/v1');
        config()->set('services.ai_agent.model', 'gpt-test');

        Http::fake([
            'https://api.openai.com/v1/*' => Http::response([
                'choices' => [
                    ['message' => ['content' => 'Respuesta AI de prueba']],
                ],
                'usage' => [
                    'prompt_tokens' => 10,
                    'completion_tokens' => 20,
                    'total_tokens' => 30,
                ],
            ], 200),
        ]);

        $conversation = AiConversation::create([
            'user_id' => $user->id,
            'title' => 'Test',
        ]);

        $response = $this->postJson("/api/ai/conversations/{$conversation->id}/messages", [
            'message' => 'Hola, sugiere mantenimiento',
        ]);

        $response->assertStatus(202);
        $response->assertJsonPath('data.conversation.id', $conversation->id);
        $response->assertJsonCount(2, 'data.messages');
        $response->assertJsonPath('data.messages.1.content', 'Respuesta AI de prueba');

        $this->assertDatabaseHas('ai_messages', [
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'provider' => 'openai',
        ]);
    }

    public function test_user_cannot_access_someone_elses_conversation(): void
    {
        $user = User::factory()->create();
        $otherConversation = AiConversation::create([
            'user_id' => User::factory()->create()->id,
            'title' => 'Otro',
        ]);

        Sanctum::actingAs($user);

        $this->postJson("/api/ai/conversations/{$otherConversation->id}/messages", [
            'message' => 'Hola',
        ])->assertForbidden();
    }
}
