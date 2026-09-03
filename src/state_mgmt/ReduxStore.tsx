import { configureStore } from '@reduxjs/toolkit'
//import downloadReducer from './downloadSlice'
import homeReducer from '../state_mgmt/HomeContentSlice'
//import profileReducer from './profileSlice'
import CommonSlice from './AppCommonSlice'
import SubscriptionReducer from './SubscriptionSlice'

export const store = configureStore({
  reducer: {
    home: homeReducer,
    subscription:SubscriptionReducer,
  //  download: downloadReducer,
  //  profile: profileReducer,
    //common: CommonSlice,
  },
})