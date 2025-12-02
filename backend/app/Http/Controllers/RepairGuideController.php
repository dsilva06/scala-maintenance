<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\RepairGuide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Requests\RepairGuideStoreRequest;
use App\Http\Requests\RepairGuideUpdateRequest;

class RepairGuideController extends Controller
{
    use HandlesQueryOptions;

    public function index(Request $request)
    {
        $query = RepairGuide::query()
            ->where('user_id', $request->user()->id);

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $this->applyQueryOptions($request, $query, [
            'created_at', 'updated_at', 'name', 'priority',
        ], [
            'name', 'description', 'category', 'type',
        ]);

        return JsonResource::collection($query->get());
    }

    public function store(RepairGuideStoreRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        $guide = $user->repairGuides()->create($validated);

        return JsonResource::make($guide)->response()->setStatusCode(201);
    }

    public function show(Request $request, RepairGuide $repairGuide)
    {
        $this->authorizeResource($request, $repairGuide);

        return JsonResource::make($repairGuide);
    }

    public function update(RepairGuideUpdateRequest $request, RepairGuide $repairGuide)
    {
        $this->authorizeResource($request, $repairGuide);

        $validated = $request->validated();

        $repairGuide->update($validated);

        return JsonResource::make($repairGuide);
    }

    public function destroy(Request $request, RepairGuide $repairGuide)
    {
        $this->authorizeResource($request, $repairGuide);

        $repairGuide->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeResource(Request $request, RepairGuide $guide): void
    {
        if ($guide->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }
}
