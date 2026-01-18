<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use phpDocumentor\Reflection\Types\Boolean;

class ProductLineTransformer extends JsonResource
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
            'createdDate'=>$this->created_at,
            'updatedDate'=>$this->updated_at,
            $this->mergeWhen(true, [
                'brands' => BrandTransformer::collection($this->brands),
            ]),

        ];
    }
}
