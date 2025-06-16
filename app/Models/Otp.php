<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
     protected $fillable = [
        'name',
        'user_id',
        'phone',
        'password',
        'email',
        'otp',
        'expires_at'

     ];
    public $timestamps = true;

    public function user()
{
    return $this->belongsTo(Users::class);
}

}
