import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration, ConfigurationOptions } from '../configuration'
import type { Middleware } from '../middleware';


import { ObservableApiApi } from "./ObservableAPI";
import { ApiApiRequestFactory, ApiApiResponseProcessor} from "../apis/ApiApi";

export interface ApiApiApiSchemaRetrieveRequest {
    /**
     * 
     * Defaults to: undefined
     * @type &#39;json&#39; | &#39;yaml&#39;
     * @memberof ApiApiapiSchemaRetrieve
     */
    format?: 'json' | 'yaml'
    /**
     * 
     * Defaults to: undefined
     * @type &#39;af&#39; | &#39;ar&#39; | &#39;ar-dz&#39; | &#39;ast&#39; | &#39;az&#39; | &#39;be&#39; | &#39;bg&#39; | &#39;bn&#39; | &#39;br&#39; | &#39;bs&#39; | &#39;ca&#39; | &#39;ckb&#39; | &#39;cs&#39; | &#39;cy&#39; | &#39;da&#39; | &#39;de&#39; | &#39;dsb&#39; | &#39;el&#39; | &#39;en&#39; | &#39;en-au&#39; | &#39;en-gb&#39; | &#39;eo&#39; | &#39;es&#39; | &#39;es-ar&#39; | &#39;es-co&#39; | &#39;es-mx&#39; | &#39;es-ni&#39; | &#39;es-ve&#39; | &#39;et&#39; | &#39;eu&#39; | &#39;fa&#39; | &#39;fi&#39; | &#39;fr&#39; | &#39;fy&#39; | &#39;ga&#39; | &#39;gd&#39; | &#39;gl&#39; | &#39;he&#39; | &#39;hi&#39; | &#39;hr&#39; | &#39;hsb&#39; | &#39;ht&#39; | &#39;hu&#39; | &#39;hy&#39; | &#39;ia&#39; | &#39;id&#39; | &#39;ig&#39; | &#39;io&#39; | &#39;is&#39; | &#39;it&#39; | &#39;ja&#39; | &#39;ka&#39; | &#39;kab&#39; | &#39;kk&#39; | &#39;km&#39; | &#39;kn&#39; | &#39;ko&#39; | &#39;ky&#39; | &#39;lb&#39; | &#39;lt&#39; | &#39;lv&#39; | &#39;mk&#39; | &#39;ml&#39; | &#39;mn&#39; | &#39;mr&#39; | &#39;ms&#39; | &#39;my&#39; | &#39;nb&#39; | &#39;ne&#39; | &#39;nl&#39; | &#39;nn&#39; | &#39;os&#39; | &#39;pa&#39; | &#39;pl&#39; | &#39;pt&#39; | &#39;pt-br&#39; | &#39;ro&#39; | &#39;ru&#39; | &#39;sk&#39; | &#39;sl&#39; | &#39;sq&#39; | &#39;sr&#39; | &#39;sr-latn&#39; | &#39;sv&#39; | &#39;sw&#39; | &#39;ta&#39; | &#39;te&#39; | &#39;tg&#39; | &#39;th&#39; | &#39;tk&#39; | &#39;tr&#39; | &#39;tt&#39; | &#39;udm&#39; | &#39;ug&#39; | &#39;uk&#39; | &#39;ur&#39; | &#39;uz&#39; | &#39;vi&#39; | &#39;zh-hans&#39; | &#39;zh-hant&#39;
     * @memberof ApiApiapiSchemaRetrieve
     */
    lang?: 'af' | 'ar' | 'ar-dz' | 'ast' | 'az' | 'be' | 'bg' | 'bn' | 'br' | 'bs' | 'ca' | 'ckb' | 'cs' | 'cy' | 'da' | 'de' | 'dsb' | 'el' | 'en' | 'en-au' | 'en-gb' | 'eo' | 'es' | 'es-ar' | 'es-co' | 'es-mx' | 'es-ni' | 'es-ve' | 'et' | 'eu' | 'fa' | 'fi' | 'fr' | 'fy' | 'ga' | 'gd' | 'gl' | 'he' | 'hi' | 'hr' | 'hsb' | 'ht' | 'hu' | 'hy' | 'ia' | 'id' | 'ig' | 'io' | 'is' | 'it' | 'ja' | 'ka' | 'kab' | 'kk' | 'km' | 'kn' | 'ko' | 'ky' | 'lb' | 'lt' | 'lv' | 'mk' | 'ml' | 'mn' | 'mr' | 'ms' | 'my' | 'nb' | 'ne' | 'nl' | 'nn' | 'os' | 'pa' | 'pl' | 'pt' | 'pt-br' | 'ro' | 'ru' | 'sk' | 'sl' | 'sq' | 'sr' | 'sr-latn' | 'sv' | 'sw' | 'ta' | 'te' | 'tg' | 'th' | 'tk' | 'tr' | 'tt' | 'udm' | 'ug' | 'uk' | 'ur' | 'uz' | 'vi' | 'zh-hans' | 'zh-hant'
}

export class ObjectApiApi {
    private api: ObservableApiApi

    public constructor(configuration: Configuration, requestFactory?: ApiApiRequestFactory, responseProcessor?: ApiApiResponseProcessor) {
        this.api = new ObservableApiApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * OpenApi3 schema for this API. Format can be selected via content negotiation.  - YAML: application/vnd.oai.openapi - JSON: application/vnd.oai.openapi+json
     * @param param the request object
     */
    public apiSchemaRetrieveWithHttpInfo(param: ApiApiApiSchemaRetrieveRequest = {}, options?: ConfigurationOptions): Promise<HttpInfo<{ [key: string]: any; }>> {
        return this.api.apiSchemaRetrieveWithHttpInfo(param.format, param.lang,  options).toPromise();
    }

    /**
     * OpenApi3 schema for this API. Format can be selected via content negotiation.  - YAML: application/vnd.oai.openapi - JSON: application/vnd.oai.openapi+json
     * @param param the request object
     */
    public apiSchemaRetrieve(param: ApiApiApiSchemaRetrieveRequest = {}, options?: ConfigurationOptions): Promise<{ [key: string]: any; }> {
        return this.api.apiSchemaRetrieve(param.format, param.lang,  options).toPromise();
    }

}
