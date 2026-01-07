<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Plan;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'test@alca.com'],
            [
                'name' => 'ALCA Demo',
                'role' => 'admin',
                'password' => Hash::make('ALCA123'),
                'email_verified_at' => now(),
            ]
        );

        $this->seedPlans();
    }

    protected function seedPlans(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'provider' => 'openai',
                'model' => 'gpt-4.1-mini',
                'monthly_message_limit' => 50,
                'price_monthly' => 0,
                'features' => [
                    'streaming' => false,
                    'context_messages' => 5,
                ],
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'provider' => 'openai',
                'model' => 'gpt-4.1',
                'monthly_message_limit' => 500,
                'price_monthly' => 19.00,
                'features' => [
                    'streaming' => true,
                    'context_messages' => 15,
                ],
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'provider' => 'openai',
                'model' => 'gpt-4.1',
                'monthly_message_limit' => 5000,
                'price_monthly' => 49.00,
                'features' => [
                    'streaming' => true,
                    'context_messages' => 25,
                ],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
