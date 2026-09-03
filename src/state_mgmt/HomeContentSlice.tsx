import {createSlice, createAsyncThunk, AsyncThunk} from '@reduxjs/toolkit';
import {API_URL, CONFIG_URL} from '../app_config/AppConstants';
import axios from 'axios';
import {device} from '../app_config/DeviceInfo';
import {ContentResponse} from '../data_models/ContentDataTypes'

const initialState = {
  brands: [],
  status: 'idle',
  error: null,
};

export const getHomeContent : any  = createAsyncThunk(
  'getContent',
  async (body:any, thunkAPI) => {
    try {
      const data = { data : { ...body,device: device, "action":"content" }}
      /*
      const headers = { headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 97qcAEaZc2mWP6cdIm03qOfYIy7SoQpM"
      }}
      */
      const res = await axios.post(API_URL, data);
      const content: ContentResponse = res.data
      // decrypt 
      // conevrt respective object
      return  res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({error: err.message});
    }
  },
);

const homeSlice = createSlice({
  name: 'Home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getHomeContent.pending, (state, action) => {
      state.status = 'loading'
    })
    builder.addCase(getHomeContent.fulfilled, (state, action) => {
      state.status = 'successful'
      state.brands = action.payload;
    })
    builder.addCase(getHomeContent.rejected, (state :any , action) => {
      state.status = 'failed'
      state.error = action.error.message
    })
  },
});

export default homeSlice.reducer;
