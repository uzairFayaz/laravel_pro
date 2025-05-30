<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Users extends Authenticatable
{
    use HasFactory, HasApiTokens;
    protected $table = 'users';
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone', // Remove if not using SMS OTPs
        'email_verified_at',
        'remember_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the groups created by the user.
     */
    public function createdGroups(): HasMany
    {
        return $this->hasMany(Groups::class, 'created_by');
    }

    /**
     * Get the groups the user is a member of.
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Groups::class, 'group_members', 'user_id', 'group_id')
                    ->withPivot('joined_via_code', 'is_shared_to_member')
                    ->withTimestamps();
    }

    /**
     * Get the stories posted by the user.
     */
    public function stories(): HasMany
    {
        return $this->hasMany(Stories::class, 'user_id');
    }

    /**
     * Get the messages sent by the user.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'user_id');
    }
}