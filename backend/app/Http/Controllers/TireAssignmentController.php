<?php

namespace App\Http\Controllers;

use App\Actions\TireAssignments\AssignTire;
use App\Http\Controllers\Concerns\AuthorizesCompanyResource;
use App\Http\Requests\TireAssignmentStoreRequest;
use App\Http\Resources\TireAssignmentResource;
use App\Queries\TireAssignments\TireAssignmentIndexQuery;
use Illuminate\Http\Request;

class TireAssignmentController extends Controller
{
    use AuthorizesCompanyResource;

    public function index(Request $request, TireAssignmentIndexQuery $indexQuery)
    {
        $assignments = $indexQuery->handle($request, $request->user())->get();

        return TireAssignmentResource::collection($assignments);
    }

    public function store(TireAssignmentStoreRequest $request, AssignTire $assignTire)
    {
        $this->authorizeCompanyWrite($request);

        $assignment = $assignTire->handle($request->user(), $request->validated());

        return TireAssignmentResource::make($assignment->load(['tire.type', 'position', 'vehicle']))
            ->response()
            ->setStatusCode(201);
    }
}
