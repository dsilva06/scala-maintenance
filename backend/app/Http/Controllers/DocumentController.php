<?php

namespace App\Http\Controllers;

use App\Actions\Documents\CreateDocument;
use App\Actions\Documents\DeleteDocument;
use App\Actions\Documents\UpdateDocument;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Models\Document;
use App\Queries\Documents\DocumentIndexQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\DocumentStoreRequest;
use App\Http\Requests\DocumentUpdateRequest;
use App\Http\Resources\DocumentResource;

class DocumentController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, DocumentIndexQuery $documentIndexQuery)
    {
        $documents = $documentIndexQuery
            ->handle($request, $request->user())
            ->get();

        return DocumentResource::collection($documents);
    }

    public function store(DocumentStoreRequest $request, CreateDocument $createDocument)
    {
        $this->authorizeCompanyWrite($request);
        $document = $createDocument->handle($request->user(), $request->validated());

        return DocumentResource::make($document->load('vehicle'))->response()->setStatusCode(201);
    }

    public function show(Request $request, Document $document)
    {
        $this->authorizeCompanyRead($request, $document);

        return DocumentResource::make($document->load('vehicle'));
    }

    public function update(DocumentUpdateRequest $request, Document $document, UpdateDocument $updateDocument)
    {
        $this->authorizeCompanyRead($request, $document);
        $this->authorizeCompanyWrite($request);

        $document = $updateDocument->handle($request->user(), $document, $request->validated());

        return DocumentResource::make($document->load('vehicle'));
    }

    public function destroy(Request $request, Document $document, DeleteDocument $deleteDocument)
    {
        $this->authorizeCompanyRead($request, $document);
        $this->authorizeCompanyWrite($request);

        $deleteDocument->handle($request->user(), $document);

        return new JsonResponse(null, 204);
    }
}
