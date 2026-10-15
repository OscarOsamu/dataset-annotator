# PatchedQuestionRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**dataset** | **number** |  | [optional] [default to undefined]
**text** | **string** |  | [optional] [default to undefined]
**type** | [**TypeEnum**](TypeEnum.md) |  | [optional] [default to undefined]
**reference_image** | **number** |  | [optional] [default to undefined]
**answer_options** | **any** |  | [optional] [default to undefined]
**allow_several_answers** | **boolean** |  | [optional] [default to undefined]
**skip_next_questions_if_null** | **boolean** |  | [optional] [default to undefined]
**minimum** | **number** |  | [optional] [default to undefined]
**maximum** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { PatchedQuestionRequest } from './api';

const instance: PatchedQuestionRequest = {
    dataset,
    text,
    type,
    reference_image,
    answer_options,
    allow_several_answers,
    skip_next_questions_if_null,
    minimum,
    maximum,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
