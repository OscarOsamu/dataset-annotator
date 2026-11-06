# Dataset


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [readonly] [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**archival_path** | **string** |  | [readonly] [default to undefined]
**question_ids** | **any** |  | [readonly] [default to undefined]
**image_count** | **number** |  | [readonly] [default to undefined]
**answer_count** | **number** |  | [readonly] [default to undefined]
**annotation_progress** | **number** |  | [readonly] [default to undefined]

## Example

```typescript
import { Dataset } from './api';

const instance: Dataset = {
    id,
    name,
    description,
    archival_path,
    question_ids,
    image_count,
    answer_count,
    annotation_progress,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
