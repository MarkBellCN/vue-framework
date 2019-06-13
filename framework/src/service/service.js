import request from '../config/request';
//测试
export const testApi = {
    test: param => request.get('/test/test'),
}