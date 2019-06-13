/**
 * @Author:xlchao
 */
export default {
    ['SET_BREAD']:(state,obj) =>{
        state.navAdrss = obj;
    },
    ['SET_PASSWORDBOX']:(state,boole) =>{
        state.editPassBox = boole;
    }
}

