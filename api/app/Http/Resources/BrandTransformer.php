<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use phpDocumentor\Reflection\Types\Boolean;

class BrandTransformer extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */

    public function toArray($request)
    {
        return [
            'id'=>(int) $this->id,
            'name'=>$this->name,
            'details'=>$this->details,
            $this->mergeWhen(true, [
                'store' => StoreTransformer::collection($this->stores),
            ]),

        ];
    }
}
