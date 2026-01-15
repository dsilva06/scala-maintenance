<?php

namespace App\Http\Requests\Concerns;

use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;
use Illuminate\Validation\Rules\Unique;

trait AppliesUserCompanyRules
{
    protected function uniqueForUserCompany(string $table, string $column, ?int $ignoreId = null): Unique
    {
        $rule = Rule::unique($table, $column);

        if ($ignoreId) {
            $rule->ignore($ignoreId);
        }

        return $this->scopeRuleForUser($rule, $this->user());
    }

    protected function existsForUserCompany(string $table, string $column = 'id'): Exists
    {
        $rule = Rule::exists($table, $column);

        return $this->scopeRuleForUser($rule, $this->user());
    }

    private function scopeRuleForUser(Unique|Exists $rule, ?User $user): Unique|Exists
    {
        if (!$user) {
            return $rule;
        }

        if ($user->company_id) {
            return $rule->where('company_id', $user->company_id);
        }

        return $rule->where('user_id', $user->id);
    }
}
