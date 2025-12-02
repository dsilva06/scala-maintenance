<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Requests\AlertStoreRequest;
use App\Http\Requests\AlertUpdateRequest;

class AlertController extends Controller
{
    use HandlesQueryOptions;

    public function index(Request $request)
    {
        $query = Alert::query()
            ->where('user_id', $request->user()->id);

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $this->applyQueryOptions($request, $query, [
            'created_at', 'severity', 'status',
        ], [
            'title', 'description', 'type', 'severity',
        ]);

        return JsonResource::collection($query->get());
    }

    public function store(AlertStoreRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        $alert = $user->alerts()->create($validated);

        return JsonResource::make($alert)->response()->setStatusCode(201);
    }

    public function show(Request $request, Alert $alert)
    {
        $this->authorizeResource($request, $alert);

        return JsonResource::make($alert);
    }

    public function update(AlertUpdateRequest $request, Alert $alert)
    {
        $this->authorizeResource($request, $alert);

        $validated = $request->validated();

        $alert->update($validated);

        return JsonResource::make($alert);
    }

    public function destroy(Request $request, Alert $alert)
    {
        $this->authorizeResource($request, $alert);

        $alert->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeResource(Request $request, Alert $alert): void
    {
        if ($alert->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }
}
