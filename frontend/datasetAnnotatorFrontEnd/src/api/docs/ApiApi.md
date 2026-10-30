# ApiApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiAnswersCreate**](#apianswerscreate) | **POST** /api/answers/ | |
|[**apiAnswersDestroy**](#apianswersdestroy) | **DELETE** /api/answers/{id}/ | |
|[**apiAnswersList**](#apianswerslist) | **GET** /api/answers/ | |
|[**apiAnswersPartialUpdate**](#apianswerspartialupdate) | **PATCH** /api/answers/{id}/ | |
|[**apiAnswersRetrieve**](#apianswersretrieve) | **GET** /api/answers/{id}/ | |
|[**apiAnswersUpdate**](#apianswersupdate) | **PUT** /api/answers/{id}/ | |
|[**apiDatasetsAnnotationDataRetrieve**](#apidatasetsannotationdataretrieve) | **GET** /api/datasets/{id}/annotation-data/ | |
|[**apiDatasetsDestroy**](#apidatasetsdestroy) | **DELETE** /api/datasets/{id}/ | |
|[**apiDatasetsList**](#apidatasetslist) | **GET** /api/datasets/ | |
|[**apiDatasetsPartialUpdate**](#apidatasetspartialupdate) | **PATCH** /api/datasets/{id}/ | |
|[**apiDatasetsRetrieve**](#apidatasetsretrieve) | **GET** /api/datasets/{id}/ | |
|[**apiDatasetsUpdate**](#apidatasetsupdate) | **PUT** /api/datasets/{id}/ | |
|[**apiDatasetsUploadCreate**](#apidatasetsuploadcreate) | **POST** /api/datasets/upload/ | |
|[**apiImagesCreate**](#apiimagescreate) | **POST** /api/images/ | |
|[**apiImagesDestroy**](#apiimagesdestroy) | **DELETE** /api/images/{id}/ | |
|[**apiImagesList**](#apiimageslist) | **GET** /api/images/ | |
|[**apiImagesPartialUpdate**](#apiimagespartialupdate) | **PATCH** /api/images/{id}/ | |
|[**apiImagesRetrieve**](#apiimagesretrieve) | **GET** /api/images/{id}/ | |
|[**apiImagesUpdate**](#apiimagesupdate) | **PUT** /api/images/{id}/ | |
|[**apiQuestionsCreate**](#apiquestionscreate) | **POST** /api/questions/ | |
|[**apiQuestionsDestroy**](#apiquestionsdestroy) | **DELETE** /api/questions/{id}/ | |
|[**apiQuestionsInfoRetrieve**](#apiquestionsinforetrieve) | **GET** /api/questions/{id}/info/ | |
|[**apiQuestionsList**](#apiquestionslist) | **GET** /api/questions/ | |
|[**apiQuestionsPartialUpdate**](#apiquestionspartialupdate) | **PATCH** /api/questions/{id}/ | |
|[**apiQuestionsRetrieve**](#apiquestionsretrieve) | **GET** /api/questions/{id}/ | |
|[**apiQuestionsUpdate**](#apiquestionsupdate) | **PUT** /api/questions/{id}/ | |
|[**apiSchemaRetrieve**](#apischemaretrieve) | **GET** /api/schema/ | |

# **apiAnswersCreate**
> Answer apiAnswersCreate(answerRequest)


### Example

```typescript
import {
    ApiApi,
    Configuration,
    AnswerRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let answerRequest: AnswerRequest; //

const { status, data } = await apiInstance.apiAnswersCreate(
    answerRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **answerRequest** | **AnswerRequest**|  | |


### Return type

**Answer**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAnswersDestroy**
> apiAnswersDestroy()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this answer. (default to undefined)

const { status, data } = await apiInstance.apiAnswersDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this answer. | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No response body |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAnswersList**
> Array<Answer> apiAnswersList()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

const { status, data } = await apiInstance.apiAnswersList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Answer>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAnswersPartialUpdate**
> Answer apiAnswersPartialUpdate()


### Example

```typescript
import {
    ApiApi,
    Configuration,
    PatchedAnswerRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this answer. (default to undefined)
let patchedAnswerRequest: PatchedAnswerRequest; // (optional)

const { status, data } = await apiInstance.apiAnswersPartialUpdate(
    id,
    patchedAnswerRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedAnswerRequest** | **PatchedAnswerRequest**|  | |
| **id** | [**number**] | A unique integer value identifying this answer. | defaults to undefined|


### Return type

**Answer**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAnswersRetrieve**
> Answer apiAnswersRetrieve()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this answer. (default to undefined)

const { status, data } = await apiInstance.apiAnswersRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this answer. | defaults to undefined|


### Return type

**Answer**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAnswersUpdate**
> Answer apiAnswersUpdate(answerRequest)


### Example

```typescript
import {
    ApiApi,
    Configuration,
    AnswerRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this answer. (default to undefined)
let answerRequest: AnswerRequest; //

const { status, data } = await apiInstance.apiAnswersUpdate(
    id,
    answerRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **answerRequest** | **AnswerRequest**|  | |
| **id** | [**number**] | A unique integer value identifying this answer. | defaults to undefined|


### Return type

**Answer**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiDatasetsAnnotationDataRetrieve**
> DatasetAnnotationData apiDatasetsAnnotationDataRetrieve()

Return pending image/question pairs and the context needed to answer them.

### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this dataset. (default to undefined)

const { status, data } = await apiInstance.apiDatasetsAnnotationDataRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this dataset. | defaults to undefined|


### Return type

**DatasetAnnotationData**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiDatasetsDestroy**
> apiDatasetsDestroy()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this dataset. (default to undefined)

const { status, data } = await apiInstance.apiDatasetsDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this dataset. | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No response body |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiDatasetsList**
> Array<Dataset> apiDatasetsList()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

const { status, data } = await apiInstance.apiDatasetsList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Dataset>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiDatasetsPartialUpdate**
> Dataset apiDatasetsPartialUpdate()


### Example

```typescript
import {
    ApiApi,
    Configuration,
    PatchedDatasetRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this dataset. (default to undefined)
let patchedDatasetRequest: PatchedDatasetRequest; // (optional)

const { status, data } = await apiInstance.apiDatasetsPartialUpdate(
    id,
    patchedDatasetRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedDatasetRequest** | **PatchedDatasetRequest**|  | |
| **id** | [**number**] | A unique integer value identifying this dataset. | defaults to undefined|


### Return type

**Dataset**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiDatasetsRetrieve**
> Dataset apiDatasetsRetrieve()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this dataset. (default to undefined)

const { status, data } = await apiInstance.apiDatasetsRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this dataset. | defaults to undefined|


### Return type

**Dataset**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiDatasetsUpdate**
> Dataset apiDatasetsUpdate(datasetRequest)


### Example

```typescript
import {
    ApiApi,
    Configuration,
    DatasetRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this dataset. (default to undefined)
let datasetRequest: DatasetRequest; //

const { status, data } = await apiInstance.apiDatasetsUpdate(
    id,
    datasetRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **datasetRequest** | **DatasetRequest**|  | |
| **id** | [**number**] | A unique integer value identifying this dataset. | defaults to undefined|


### Return type

**Dataset**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiDatasetsUploadCreate**
> DatasetUploadResponse apiDatasetsUploadCreate()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let name: string; // (default to undefined)
let files: Array<File>; // (default to undefined)
let description: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiDatasetsUploadCreate(
    name,
    files,
    description
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **name** | [**string**] |  | defaults to undefined|
| **files** | **Array&lt;File&gt;** |  | defaults to undefined|
| **description** | [**string**] |  | (optional) defaults to undefined|


### Return type

**DatasetUploadResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |
|**400** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiImagesCreate**
> Image apiImagesCreate()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let dataset: number; // (default to undefined)
let file: File; // (default to undefined)
let isReferenceImage: boolean; // (optional) (default to false)

const { status, data } = await apiInstance.apiImagesCreate(
    dataset,
    file,
    isReferenceImage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dataset** | [**number**] |  | defaults to undefined|
| **file** | [**File**] |  | defaults to undefined|
| **isReferenceImage** | [**boolean**] |  | (optional) defaults to false|


### Return type

**Image**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiImagesDestroy**
> apiImagesDestroy()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this image. (default to undefined)

const { status, data } = await apiInstance.apiImagesDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this image. | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No response body |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiImagesList**
> Array<Image> apiImagesList()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

const { status, data } = await apiInstance.apiImagesList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Image>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiImagesPartialUpdate**
> Image apiImagesPartialUpdate()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this image. (default to undefined)
let dataset: number; // (optional) (default to undefined)
let isReferenceImage: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiImagesPartialUpdate(
    id,
    dataset,
    isReferenceImage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this image. | defaults to undefined|
| **dataset** | [**number**] |  | (optional) defaults to undefined|
| **isReferenceImage** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**Image**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiImagesRetrieve**
> Image apiImagesRetrieve()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this image. (default to undefined)

const { status, data } = await apiInstance.apiImagesRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this image. | defaults to undefined|


### Return type

**Image**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiImagesUpdate**
> Image apiImagesUpdate()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this image. (default to undefined)
let dataset: number; // (default to undefined)
let isReferenceImage: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiImagesUpdate(
    id,
    dataset,
    isReferenceImage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this image. | defaults to undefined|
| **dataset** | [**number**] |  | defaults to undefined|
| **isReferenceImage** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**Image**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiQuestionsCreate**
> Question apiQuestionsCreate(questionRequest)


### Example

```typescript
import {
    ApiApi,
    Configuration,
    QuestionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let questionRequest: QuestionRequest; //

const { status, data } = await apiInstance.apiQuestionsCreate(
    questionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **questionRequest** | **QuestionRequest**|  | |


### Return type

**Question**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiQuestionsDestroy**
> apiQuestionsDestroy()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this question. (default to undefined)

const { status, data } = await apiInstance.apiQuestionsDestroy(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this question. | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No response body |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiQuestionsInfoRetrieve**
> QuestionInfoResponse apiQuestionsInfoRetrieve()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this question. (default to undefined)

const { status, data } = await apiInstance.apiQuestionsInfoRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this question. | defaults to undefined|


### Return type

**QuestionInfoResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiQuestionsList**
> Array<Question> apiQuestionsList()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

const { status, data } = await apiInstance.apiQuestionsList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Question>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiQuestionsPartialUpdate**
> Question apiQuestionsPartialUpdate()


### Example

```typescript
import {
    ApiApi,
    Configuration,
    PatchedQuestionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this question. (default to undefined)
let patchedQuestionRequest: PatchedQuestionRequest; // (optional)

const { status, data } = await apiInstance.apiQuestionsPartialUpdate(
    id,
    patchedQuestionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchedQuestionRequest** | **PatchedQuestionRequest**|  | |
| **id** | [**number**] | A unique integer value identifying this question. | defaults to undefined|


### Return type

**Question**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiQuestionsRetrieve**
> Question apiQuestionsRetrieve()


### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this question. (default to undefined)

const { status, data } = await apiInstance.apiQuestionsRetrieve(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | A unique integer value identifying this question. | defaults to undefined|


### Return type

**Question**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiQuestionsUpdate**
> Question apiQuestionsUpdate(questionRequest)


### Example

```typescript
import {
    ApiApi,
    Configuration,
    QuestionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let id: number; //A unique integer value identifying this question. (default to undefined)
let questionRequest: QuestionRequest; //

const { status, data } = await apiInstance.apiQuestionsUpdate(
    id,
    questionRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **questionRequest** | **QuestionRequest**|  | |
| **id** | [**number**] | A unique integer value identifying this question. | defaults to undefined|


### Return type

**Question**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiSchemaRetrieve**
> { [key: string]: any; } apiSchemaRetrieve()

OpenApi3 schema for this API. Format can be selected via content negotiation.  - YAML: application/vnd.oai.openapi - JSON: application/vnd.oai.openapi+json

### Example

```typescript
import {
    ApiApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApiApi(configuration);

let format: 'json' | 'yaml'; // (optional) (default to undefined)
let lang: 'af' | 'ar' | 'ar-dz' | 'ast' | 'az' | 'be' | 'bg' | 'bn' | 'br' | 'bs' | 'ca' | 'ckb' | 'cs' | 'cy' | 'da' | 'de' | 'dsb' | 'el' | 'en' | 'en-au' | 'en-gb' | 'eo' | 'es' | 'es-ar' | 'es-co' | 'es-mx' | 'es-ni' | 'es-ve' | 'et' | 'eu' | 'fa' | 'fi' | 'fr' | 'fy' | 'ga' | 'gd' | 'gl' | 'he' | 'hi' | 'hr' | 'hsb' | 'hu' | 'hy' | 'ia' | 'id' | 'ig' | 'io' | 'is' | 'it' | 'ja' | 'ka' | 'kab' | 'kk' | 'km' | 'kn' | 'ko' | 'ky' | 'lb' | 'lt' | 'lv' | 'mk' | 'ml' | 'mn' | 'mr' | 'ms' | 'my' | 'nb' | 'ne' | 'nl' | 'nn' | 'os' | 'pa' | 'pl' | 'pt' | 'pt-br' | 'ro' | 'ru' | 'sk' | 'sl' | 'sq' | 'sr' | 'sr-latn' | 'sv' | 'sw' | 'ta' | 'te' | 'tg' | 'th' | 'tk' | 'tr' | 'tt' | 'udm' | 'ug' | 'uk' | 'ur' | 'uz' | 'vi' | 'zh-hans' | 'zh-hant'; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiSchemaRetrieve(
    format,
    lang
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **format** | [**&#39;json&#39; | &#39;yaml&#39;**]**Array<&#39;json&#39; &#124; &#39;yaml&#39;>** |  | (optional) defaults to undefined|
| **lang** | [**&#39;af&#39; | &#39;ar&#39; | &#39;ar-dz&#39; | &#39;ast&#39; | &#39;az&#39; | &#39;be&#39; | &#39;bg&#39; | &#39;bn&#39; | &#39;br&#39; | &#39;bs&#39; | &#39;ca&#39; | &#39;ckb&#39; | &#39;cs&#39; | &#39;cy&#39; | &#39;da&#39; | &#39;de&#39; | &#39;dsb&#39; | &#39;el&#39; | &#39;en&#39; | &#39;en-au&#39; | &#39;en-gb&#39; | &#39;eo&#39; | &#39;es&#39; | &#39;es-ar&#39; | &#39;es-co&#39; | &#39;es-mx&#39; | &#39;es-ni&#39; | &#39;es-ve&#39; | &#39;et&#39; | &#39;eu&#39; | &#39;fa&#39; | &#39;fi&#39; | &#39;fr&#39; | &#39;fy&#39; | &#39;ga&#39; | &#39;gd&#39; | &#39;gl&#39; | &#39;he&#39; | &#39;hi&#39; | &#39;hr&#39; | &#39;hsb&#39; | &#39;hu&#39; | &#39;hy&#39; | &#39;ia&#39; | &#39;id&#39; | &#39;ig&#39; | &#39;io&#39; | &#39;is&#39; | &#39;it&#39; | &#39;ja&#39; | &#39;ka&#39; | &#39;kab&#39; | &#39;kk&#39; | &#39;km&#39; | &#39;kn&#39; | &#39;ko&#39; | &#39;ky&#39; | &#39;lb&#39; | &#39;lt&#39; | &#39;lv&#39; | &#39;mk&#39; | &#39;ml&#39; | &#39;mn&#39; | &#39;mr&#39; | &#39;ms&#39; | &#39;my&#39; | &#39;nb&#39; | &#39;ne&#39; | &#39;nl&#39; | &#39;nn&#39; | &#39;os&#39; | &#39;pa&#39; | &#39;pl&#39; | &#39;pt&#39; | &#39;pt-br&#39; | &#39;ro&#39; | &#39;ru&#39; | &#39;sk&#39; | &#39;sl&#39; | &#39;sq&#39; | &#39;sr&#39; | &#39;sr-latn&#39; | &#39;sv&#39; | &#39;sw&#39; | &#39;ta&#39; | &#39;te&#39; | &#39;tg&#39; | &#39;th&#39; | &#39;tk&#39; | &#39;tr&#39; | &#39;tt&#39; | &#39;udm&#39; | &#39;ug&#39; | &#39;uk&#39; | &#39;ur&#39; | &#39;uz&#39; | &#39;vi&#39; | &#39;zh-hans&#39; | &#39;zh-hant&#39;**]**Array<&#39;af&#39; &#124; &#39;ar&#39; &#124; &#39;ar-dz&#39; &#124; &#39;ast&#39; &#124; &#39;az&#39; &#124; &#39;be&#39; &#124; &#39;bg&#39; &#124; &#39;bn&#39; &#124; &#39;br&#39; &#124; &#39;bs&#39; &#124; &#39;ca&#39; &#124; &#39;ckb&#39; &#124; &#39;cs&#39; &#124; &#39;cy&#39; &#124; &#39;da&#39; &#124; &#39;de&#39; &#124; &#39;dsb&#39; &#124; &#39;el&#39; &#124; &#39;en&#39; &#124; &#39;en-au&#39; &#124; &#39;en-gb&#39; &#124; &#39;eo&#39; &#124; &#39;es&#39; &#124; &#39;es-ar&#39; &#124; &#39;es-co&#39; &#124; &#39;es-mx&#39; &#124; &#39;es-ni&#39; &#124; &#39;es-ve&#39; &#124; &#39;et&#39; &#124; &#39;eu&#39; &#124; &#39;fa&#39; &#124; &#39;fi&#39; &#124; &#39;fr&#39; &#124; &#39;fy&#39; &#124; &#39;ga&#39; &#124; &#39;gd&#39; &#124; &#39;gl&#39; &#124; &#39;he&#39; &#124; &#39;hi&#39; &#124; &#39;hr&#39; &#124; &#39;hsb&#39; &#124; &#39;hu&#39; &#124; &#39;hy&#39; &#124; &#39;ia&#39; &#124; &#39;id&#39; &#124; &#39;ig&#39; &#124; &#39;io&#39; &#124; &#39;is&#39; &#124; &#39;it&#39; &#124; &#39;ja&#39; &#124; &#39;ka&#39; &#124; &#39;kab&#39; &#124; &#39;kk&#39; &#124; &#39;km&#39; &#124; &#39;kn&#39; &#124; &#39;ko&#39; &#124; &#39;ky&#39; &#124; &#39;lb&#39; &#124; &#39;lt&#39; &#124; &#39;lv&#39; &#124; &#39;mk&#39; &#124; &#39;ml&#39; &#124; &#39;mn&#39; &#124; &#39;mr&#39; &#124; &#39;ms&#39; &#124; &#39;my&#39; &#124; &#39;nb&#39; &#124; &#39;ne&#39; &#124; &#39;nl&#39; &#124; &#39;nn&#39; &#124; &#39;os&#39; &#124; &#39;pa&#39; &#124; &#39;pl&#39; &#124; &#39;pt&#39; &#124; &#39;pt-br&#39; &#124; &#39;ro&#39; &#124; &#39;ru&#39; &#124; &#39;sk&#39; &#124; &#39;sl&#39; &#124; &#39;sq&#39; &#124; &#39;sr&#39; &#124; &#39;sr-latn&#39; &#124; &#39;sv&#39; &#124; &#39;sw&#39; &#124; &#39;ta&#39; &#124; &#39;te&#39; &#124; &#39;tg&#39; &#124; &#39;th&#39; &#124; &#39;tk&#39; &#124; &#39;tr&#39; &#124; &#39;tt&#39; &#124; &#39;udm&#39; &#124; &#39;ug&#39; &#124; &#39;uk&#39; &#124; &#39;ur&#39; &#124; &#39;uz&#39; &#124; &#39;vi&#39; &#124; &#39;zh-hans&#39; &#124; &#39;zh-hant&#39;>** |  | (optional) defaults to undefined|


### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/vnd.oai.openapi, application/yaml, application/vnd.oai.openapi+json, application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

