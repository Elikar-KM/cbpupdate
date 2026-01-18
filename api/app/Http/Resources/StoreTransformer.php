<?php

namespace App\Http\Resources;

use App\Http\Resources\UserTransformer;
use Illuminate\Http\Resources\Json\JsonResource; 

class StoreTransformer extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'=>(int) $this->id,
            'name'=>$this->name,
            'details'=>$this->details,
            'owner'=> new UserTransformer($this->owner),
            'admins'=> UserTransformer::collection($this->users),
        ];
    }
}
