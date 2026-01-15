<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

trait AuthorizesCompanyResource
{
    protected function authorizeCompanyRead(Request $request, Model $model): void
    {
        $user = $request->user();
        $ownerId = $model->getAttribute('user_id');

        if (!$user) {
            abort(403, 'No autorizado.');
        }

        if ($model->company_id) {
            if (!$user->company_id || $model->company_id !== $user->company_id) {
                abort(403, 'No autorizado.');
            }
        } elseif ($ownerId && (int) $ownerId !== $user->id) {
            abort(403, 'No autorizado.');
        }

        if ($user->isDriver() && $ownerId && (int) $ownerId !== $user->id) {
            abort(403, 'No autorizado.');
        }
    }

    protected function authorizeCompanyWrite(Request $request): void
    {
        $user = $request->user();

        if (!$user || !$user->canManageCompany()) {
            abort(403, 'No autorizado.');
        }
    }
}
