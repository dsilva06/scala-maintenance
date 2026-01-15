<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(RegisterRequest $request): Response
    {
        $validated = $request->validated();

        $companyName = $validated['company_name'] ?? ($validated['name'] . ' Company');
        $slug = Str::slug($companyName);
        $suffix = 1;

        while (Company::where('slug', $slug)->exists()) {
            $suffix++;
            $slug = Str::slug($companyName) . '-' . $suffix;
        }

        $company = Company::create([
            'name' => $companyName,
            'slug' => $slug,
        ]);

        $user = User::create([
            'company_id' => $company->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => 'employee',
            'password' => Hash::make($request->string('password')),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
