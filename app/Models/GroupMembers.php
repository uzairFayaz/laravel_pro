<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupMembers extends Model
{
    protected $table = 'group_members';
    protected $fillable = ['group_id', 'user_id', 'is_shared'];

    public function group()
    {
        return $this->belongsTo(Groups::class, 'group_id');
    }

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id');
    }
}