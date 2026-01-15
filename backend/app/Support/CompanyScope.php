<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class CompanyScope
{
    public static function apply(Builder $query, User $user, bool $includeLegacy = true): Builder
    {
        if ($user->company_id) {
            $query->where(function (Builder $builder) use ($user, $includeLegacy) {
                $builder->where('company_id', $user->company_id);

                if ($includeLegacy) {
                    $builder->orWhere(function (Builder $legacy) use ($user) {
                        $legacy->whereNull('company_id')
                            ->where('user_id', $user->id);
                    });
                }
            });
        } else {
            $query->where('user_id', $user->id);
        }

        if ($user->isDriver()) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }
}
