<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesQueryOptions;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Requests\DocumentStoreRequest;
use App\Http\Requests\DocumentUpdateRequest;

class DocumentController extends Controller
{
    use HandlesQueryOptions;

    public function index(Request $request)
    {
        $query = Document::query()
            ->with('vehicle')
            ->where('user_id', $request->user()->id);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        if ($type = $request->query('document_type')) {
            $query->where('document_type', $type);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $this->applyQueryOptions($request, $query, [
            'expiration_date', 'created_at', 'document_type',
        ], [
            'document_number', 'issuing_entity', 'document_type',
        ]);

        return JsonResource::collection($query->get());
    }

    public function store(DocumentStoreRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        $document = $user->documents()->create($validated);

        return JsonResource::make($document->load('vehicle'))->response()->setStatusCode(201);
    }

    public function show(Request $request, Document $document)
    {
        $this->authorizeResource($request, $document);

        return JsonResource::make($document->load('vehicle'));
    }

    public function update(DocumentUpdateRequest $request, Document $document)
    {
        $this->authorizeResource($request, $document);

        $validated = $request->validated();

        $document->update($validated);

        return JsonResource::make($document->load('vehicle'));
    }

    public function destroy(Request $request, Document $document)
    {
        $this->authorizeResource($request, $document);

        $document->delete();

        return new JsonResponse(null, 204);
    }

    protected function authorizeResource(Request $request, Document $document): void
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403, 'No autorizado.');
        }
    }
}
