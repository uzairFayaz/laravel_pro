<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;

    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function build()
    {
        return $this
                    ->subject('Your OTP for Verification')
                    ->html("<p>your OTP is <strong>{$this->otp}</strong></p>")
                    ->with(['otp' => $this->otp]);
    }
}
