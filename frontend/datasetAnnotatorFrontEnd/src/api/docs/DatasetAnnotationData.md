# DatasetAnnotationData


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tasks** | [**Array&lt;AnnotationTask&gt;**](AnnotationTask.md) |  | [default to undefined]
**images** | [**Array&lt;Image&gt;**](Image.md) |  | [default to undefined]
**reference_images** | [**Array&lt;Image&gt;**](Image.md) |  | [default to undefined]
**questions** | [**Array&lt;Question&gt;**](Question.md) |  | [default to undefined]
**answers** | [**Array&lt;Answer&gt;**](Answer.md) |  | [default to undefined]
**total_images** | **number** |  | [default to undefined]
**next_cursor** | **number** |  | [default to undefined]

## Example

```typescript
import { DatasetAnnotationData } from './api';

const instance: DatasetAnnotationData = {
    tasks,
    images,
    reference_images,
    questions,
    answers,
    total_images,
    next_cursor,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
