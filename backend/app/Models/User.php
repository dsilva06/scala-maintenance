<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_MANAGER = 'manager';
    public const ROLE_DRIVER = 'driver';
    public const ROLE_EMPLOYEE = 'employee';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'email',
        'role',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function maintenanceOrders()
    {
        return $this->hasMany(MaintenanceOrder::class);
    }

    public function spareParts()
    {
        return $this->hasMany(SparePart::class);
    }

    public function inspections()
    {
        return $this->hasMany(Inspection::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function repairGuides()
    {
        return $this->hasMany(RepairGuide::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function tireTypes()
    {
        return $this->hasMany(TireType::class);
    }

    public function tires()
    {
        return $this->hasMany(Tire::class);
    }

    public function suppliers()
    {
        return $this->hasMany(Supplier::class);
    }

    public function aiMemories()
    {
        return $this->hasMany(AiMemory::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isManager(): bool
    {
        return $this->role === self::ROLE_MANAGER;
    }

    public function isDriver(): bool
    {
        return $this->role === self::ROLE_DRIVER;
    }

    public function canManageCompany(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN, self::ROLE_MANAGER, self::ROLE_EMPLOYEE], true);
    }
}
