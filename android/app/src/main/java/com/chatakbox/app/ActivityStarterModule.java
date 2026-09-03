package com.chatakbox.app;




import android.content.Intent;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ActivityStarterModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;

    ActivityStarterModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "ActivityStarter";
    }

    @ReactMethod
    public void navigateToVideo(
            String mediaUrl,
            String videoTitle,
            String downloadID,
            String resume,
            String subtitle,
            String videotrackingurl ) {
        Context context = getReactApplicationContext();
        Intent intent = new Intent(context, VideoPlayer.class);
        MediaParams mediaParams=new MediaParams(mediaUrl, videoTitle,downloadID,resume,subtitle,videotrackingurl);
        intent.putExtra("mediaparams", mediaParams);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

}

