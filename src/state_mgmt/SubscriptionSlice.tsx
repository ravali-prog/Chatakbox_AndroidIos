const initialState = {
    count: 10
};

const SubscriptionReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case 'SUB_CHNAGED':
            return {
                ...state,
                count: action.payload
            };
        default:
            return state;
    }
}
export default SubscriptionReducer;