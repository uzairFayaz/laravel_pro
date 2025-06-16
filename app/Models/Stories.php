<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stories extends Model
{
    protected $fillable = ['user_id', 'group_id', 'content', 'type', 'expires_at'];

    public function user()
    {
        return $this->belongsTo(Users::class);
    }

    public function group()
    {
        return $this->belongsTo(Groups::class);
    }
}