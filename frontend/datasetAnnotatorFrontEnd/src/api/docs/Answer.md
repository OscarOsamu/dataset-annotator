# Answer


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [readonly] [default to undefined]
**dataset** | **number** |  | [default to undefined]
**image** | **number** |  | [default to undefined]
**question** | **number** |  | [default to undefined]
**answer_integer** | **number** |  | [optional] [default to undefined]
**answer_choices** | **any** |  | [optional] [default to undefined]
**is_unclear** | **boolean** |  | [optional] [default to undefined]
**created_at** | **string** |  | [readonly] [default to undefined]

## Example

```typescript
import { Answer } from './api';

const instance: Answer = {
    id,
    dataset,
    image,
    question,
    answer_integer,
    answer_choices,
    is_unclear,
    created_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
