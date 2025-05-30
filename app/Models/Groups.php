<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Groups extends Model
{
    protected $table = 'groups';
    protected $fillable = ['name', 'description', 'created_by', 'is_shared', 'share_code'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($group) {
            if (is_null($group->share_code)) {
                $group->share_code = Str::random(10);
            }
        });
    }

    public function creator()
    {
        return $this->belongsTo(Users::class, 'created_by');
    }

    public function members()
    {
        return $this->hasMany(GroupMembers::class, 'group_id');
    }
}