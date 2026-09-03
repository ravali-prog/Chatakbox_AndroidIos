package com.chatakbox.app;

import android.app.PendingIntent;
import android.app.PictureInPictureParams;
import android.app.RemoteAction;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.drawable.Icon;
import android.media.browse.MediaBrowser;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.util.Rational;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.media3.common.AudioAttributes;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.common.Tracks;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.ui.PlayerView;

import com.facebook.react.BuildConfig;
import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class VideoPlayer extends ReactActivity {

    private PlayerView playerView;
    private ExoPlayer player;
    private ImageView selectTracksButton;
    private Tracks lastSeenTracks;
    private boolean isShowingTrackSelectionDialog;

    private ImageView back;

    private ProgressBar progressbar;

    private long maxWatchedTime = 0;
    private long elapsedTime = 0;
    private boolean onVideoEnd = false;
    // private String mediaParams.getVideoTrackingLink() = "";
    private int totalWatchedTime = 0;
    private String sessionID = "";

    private MediaParams mediaParams = null;

    private ImageView playPauseButton;
    private ImageView forwardButton;
    private ImageView backwardButton;

    private TextView videoTitle;
    private SeekBar seekBar;
    private boolean isPlaying = false;

    private TextView totalTimeTextView;
    private ImageView muteButton;
private boolean isMuted = false;

    private TextView currentTimeTextView;

    private RelativeLayout controls_layout;

    @Override
    public void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            isPlaying = player.isPlaying();
            enterPictureInPictureMode(buildPictureInPictureParams(isPlaying));
        }
    }

    private PictureInPictureParams buildPictureInPictureParams(boolean isPlaying) {
        // Aspect ratio for PiP (16:9)
        Rational aspectRatio = new Rational(16, 9);

        Icon playPauseIcon = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            playPauseIcon = isPlaying ? Icon.createWithResource(this, R.drawable.pause)
                    : Icon.createWithResource(this, R.drawable.play);
        }

        PendingIntent playPausePendingIntent = PendingIntent.getBroadcast(
                this, isPlaying ? 0 : 1,
                new Intent("MEDIA_CONTROL").putExtra("control_type", "play_pause"),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Add Play/Pause action
        List<RemoteAction> actions = new ArrayList<>();
        RemoteAction playPauseAction = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            playPauseAction = new RemoteAction(
                    playPauseIcon,
                    "Play/Pause",
                    "Play/Pause",
                    playPausePendingIntent);
        }
        actions.add(playPauseAction);

        // Build PictureInPictureParams
        return new PictureInPictureParams.Builder()
                .setAspectRatio(aspectRatio)
                .setActions(actions)
                .build();
    }

    @Override
    public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, Configuration newConfig) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
        if (isInPictureInPictureMode) {

            if (isPlaying) {
                player.play();
            }

            controls_layout.setVisibility(View.GONE);

        } else {

            controls_layout.setVisibility(View.VISIBLE);

            if (isPlaying) {
                player.play();
            } else {
                player.pause();
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                getWindow().getDecorView().setSystemUiVisibility(
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                                | View.SYSTEM_UI_FLAG_FULLSCREEN
                                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
            }

        }
    }

    private final BroadcastReceiver pipActionReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String controlType = intent.getStringExtra("control_type");
            Log.d("PIP_RECEIVER", "Received control: " + controlType);

            if ("play_pause".equals(controlType)) {
                togglePlayPause();
            }
        }
    };

    private void updatePictureInPictureParams() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            setPictureInPictureParams(buildPictureInPictureParams(isPlaying));
        }
    }

    private final Runnable updateSeekBarRunnable = new Runnable() {
        @Override
        public void run() {
            updateSeekBar();
            handler.postDelayed(this, 1000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);

        setContentView(R.layout.activity_main);

        playerView = findViewById(R.id.player);

        progressbar = findViewById(R.id.progressbar);

//        progressbar.getIndeterminateDrawable().setColorFilter(0xFFFF0000, android.graphics.PorterDuff.Mode.MULTIPLY);
        progressbar.getIndeterminateDrawable().setColorFilter(0xFFFF7A00, android.graphics.PorterDuff.Mode.SRC_IN);
muteButton = findViewById(R.id.muteButton);
        playPauseButton = findViewById(R.id.playPauseButton);
        forwardButton = findViewById(R.id.forwardButton);
        backwardButton = findViewById(R.id.backwardButton);
        seekBar = findViewById(R.id.seekBar);
        videoTitle = findViewById(R.id.title);
        controls_layout = findViewById(R.id.controls_layout);

        // registerReceiver(pipActionReceiver, new IntentFilter("MEDIA_CONTROL"));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) { // Android 13 (API 33) and later
            registerReceiver(pipActionReceiver, new IntentFilter("MEDIA_CONTROL"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(pipActionReceiver, new IntentFilter("MEDIA_CONTROL"));
        }

        setUpPlayer();

        playPauseButton.setOnClickListener(v -> togglePlayPause());
        handler.post(updateSeekBarRunnable);

        forwardButton.setOnClickListener(v -> {
            player.seekTo(player.getCurrentPosition() + 10000);
        });

        backwardButton.setOnClickListener(v -> {
            player.seekTo(player.getCurrentPosition() - 10000);
        });

        muteButton.setOnClickListener(v -> toggleMute());

        seekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser) {
                    player.seekTo(progress);
                }
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
            }
        });


        String subtitleUrl = "https://bitdash-a.akamaihd.net/content/sintel/subtitles/subtitles_en.vtt";
        String subtitleLanguage = "EN";

        selectTracksButton = findViewById(R.id.select_tracks_button);
        back = findViewById(R.id.back);

        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                onBackPressed();
            }
        });

        selectTracksButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                logMessage("MainActivity", "Select Tracks button clicked");

                if (!isShowingTrackSelectionDialog && TrackSelectionDialog.willHaveContent(player)) {
                    logMessage("MainActivity", "Showing TrackSelectionDialog");

                    // Pause and update UI when dialog opens
                    boolean wasPlaying = player.isPlaying();
                    if (wasPlaying) {
                        player.pause();
                        playPauseButton.setImageResource(R.drawable.play);
                        isPlaying = false;
                    }

                    isShowingTrackSelectionDialog = true;
                    TrackSelectionDialog trackSelectionDialog = TrackSelectionDialog.createForPlayer(
                            player,
                            dismissedDialog -> {
                                isShowingTrackSelectionDialog = false;
                                // Resume only if it was playing before the dialog opened
                                if (wasPlaying) {
                                    player.play();
                                    playPauseButton.setImageResource(R.drawable.pause);
                                    isPlaying = true;
                                }
                            });
                    trackSelectionDialog.show(getSupportFragmentManager(), null);
                } else {
                    logMessage("MainActivity", "No tracks available to select");
                }
            }
        });

        Intent intent = getIntent();
        mediaParams = (MediaParams) intent.getSerializableExtra("mediaparams");

        if (mediaParams != null) {
            String title = mediaParams.getVideoTitle();

            videoTitle.setText(title);

            addMediaItem(mediaParams);
        } else {
            finish();
        }
        sessionID = System.currentTimeMillis() + "";
        startAnalyticsTimer();

    }


    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        // Lock orientation to landscape
        if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        }
    }

    @Override
    public void onBackPressed() {

        finish();
        Intent intent = new Intent(getApplicationContext(), MainActivity.class);
        startActivity(intent);
    }


    boolean seekpositionset = false;

    private class PlayerEventListener implements Player.Listener {

        // @Override
        // public void onIsLoadingChanged(boolean isLoading) {
        //     // showloading accordinly
        //     if (isLoading) {
        //         progressbar.setVisibility(View.VISIBLE);
        //     } else {
        //         progressbar.setVisibility(View.GONE);
        //     }
        // }

        // @Override
        // public void onIsPlayingChanged(boolean isPlaying) {
        //     System.out.println("VideoEventFire :: onIsPlayingChanged " + isPlaying + " : "
        //             + mediaParams.getResumeNumber() + " : " + isPlaying);
        //     if (isPlaying) {
        //         progressbar.setVisibility(View.GONE);
        //         if (!seekpositionset && mediaParams.getResumeNumber() > 0) {
        //             player.seekTo(mediaParams.getResumeNumber() * 1000);
        //             seekpositionset = true;
        //         }
        //         fireVideoEvents("play");
        //     } else {
        //         fireVideoEvents("pause");
        //     }
        // }

        @Override
public void onIsLoadingChanged(boolean isLoading) {
    // Only show loader if loading AND video is not actively playing
    if (isLoading && !player.isPlaying()) {
        progressbar.setVisibility(View.VISIBLE);
    } else {
        progressbar.setVisibility(View.GONE);
    }
}

@Override
public void onPlaybackStateChanged(@Player.State int playbackState) {
    System.out.println("VideoEventFire :: " + playbackState + " : " + player.isPlaying());
    updatePlayPauseButton(playbackState == Player.STATE_READY && player.isPlaying());

    if (playbackState == Player.STATE_BUFFERING) {
        // Only show loader if truly stuck (not playing)
        progressbar.setVisibility(View.VISIBLE);
    } else if (playbackState == Player.STATE_READY) {
        progressbar.setVisibility(View.GONE);
    }
    updateSeekBar();
}

@Override
public void onIsPlayingChanged(boolean isPlaying) {
    System.out.println("VideoEventFire :: onIsPlayingChanged " + isPlaying);
    if (isPlaying) {
        // Hide loader immediately when playback actually starts
        progressbar.setVisibility(View.GONE);
        if (!seekpositionset && mediaParams.getResumeNumber() > 0) {
            player.seekTo(mediaParams.getResumeNumber() * 1000);
            seekpositionset = true;
        }
        fireVideoEvents("play");
    } else {
        fireVideoEvents("pause");
    }
}

        @Override
        public void onPlayWhenReadyChanged(boolean playWhenReady, int reason) {
            // System.out.println("VideoEventFire :: onPlayWhenReadyChanged "+playWhenReady
            // + " : "+ reason );
        }

        // @Override
        // public void onPlaybackStateChanged(@Player.State int playbackState) {
        //     // if (playbackState == Player.STATE_ENDED) {
        //     // }
        //     // updateButtonVisibility();
        //     System.out.println("VideoEventFire :: " + playbackState + " : " + player.isPlaying());
        //     updatePlayPauseButton(playbackState == Player.STATE_READY && player.isPlaying());
        //     if (playbackState == Player.STATE_BUFFERING) {
        //         // show progress
        //         progressbar.setVisibility(View.VISIBLE);
        //     } else if (playbackState == Player.STATE_READY) {
        //         // updateSeekBar();

        //         // player.seekTo(Integer.parseInt(mediaParams.getResume()));
        //         progressbar.setVisibility(View.GONE);
        //     }
        //     updateSeekBar();

        // }

        @Override
        public void onPlayerError(PlaybackException error) {
            if (error.errorCode == PlaybackException.ERROR_CODE_BEHIND_LIVE_WINDOW) {
                player.seekToDefaultPosition();
                player.prepare();
            } else {
                updateButtonVisibility();
            }
        }


        @Override
        public void onTracksChanged(Tracks tracks) {
            updateButtonVisibility();
            if (tracks == lastSeenTracks) {
                return;
            }
            if (tracks.containsType(C.TRACK_TYPE_VIDEO)
                    && !tracks.isTypeSupported(C.TRACK_TYPE_VIDEO, /* allowExceedsCapabilities= */ true)) {
                showToast("error_unsupported_video");
            }
            if (tracks.containsType(C.TRACK_TYPE_AUDIO)
                    && !tracks.isTypeSupported(C.TRACK_TYPE_AUDIO, /* allowExceedsCapabilities= */ true)) {
                showToast("error_unsupported_audio");
            }
            lastSeenTracks = tracks;
        }
    }

    private void setUpPlayer() {
        lastSeenTracks = Tracks.EMPTY;


        player = new ExoPlayer.Builder(this).build();
    

        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(C.USAGE_MEDIA)
                .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
                .build();

        player.setAudioAttributes(audioAttributes, false);
        playerView.setPlayer(player);


        playerView.setShowNextButton(false);
        player.addListener(new PlayerEventListener());
        playerView.setShowPreviousButton(false);
        playerView.setUseController(false);
        player.setVideoScalingMode(C.VIDEO_SCALING_MODE_SCALE_TO_FIT);

        playerView.setUseController(true);
        playerView.setShowSubtitleButton(false);

        player.addListener(new Player.Listener() {

            public void onSubtitleAvailable(int trackIndex, int rendererIndex) {
                playerView.setShowSubtitleButton(false);
            }

            public void onSubtitleDisabled() {
                playerView.setShowSubtitleButton(false);
            }
        });
    }

    private void addMediaItem(MediaParams mediaParams) {

        // Uri contentUri = Uri.parse(getString(R.string.content_url));
        // Uri adTagUri = Uri.parse(getString(R.string.ad_tag_url));

        System.out.println("subtitles" + mediaParams.getSubtitleObject());

        ArrayList<MediaItem.SubtitleConfiguration> subtitleConfigurations = new ArrayList<>();

        try {

            if (mediaParams.getSubtitleObject() != null) {
                JSONArray jsonArray = mediaParams.getSubtitleObject().getJSONArray("subtitles");
                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject jsonObject = jsonArray.getJSONObject(i);
                    String url = jsonObject.optString("url");
                    String mimeType = jsonObject.optString("format");
                    if (mimeType.equals("vtt")) {
                        mimeType = MimeTypes.TEXT_VTT;
                    }
                    if (mimeType.equals("srt")) {
                        mimeType = MimeTypes.APPLICATION_SUBRIP;
                    }
                    // url=
                    // "https://bitdash-a.akamaihd.net/content/sintel/subtitles/subtitles_en.vtt";
                    MediaItem.SubtitleConfiguration subtitleConfiguration = new MediaItem.SubtitleConfiguration.Builder(
                            Uri.parse(url))
                            .setMimeType(mimeType)
                            .setLanguage(jsonObject.optString("lang"))
                            .build();

                    subtitleConfigurations.add(subtitleConfiguration);

                }

            }
        } catch (Exception e) {
            e.printStackTrace();

        }

        MediaItem mediaItem = new MediaItem.Builder()
                .setUri(Uri.parse(mediaParams.mediaUrl))
                .setMimeType(MimeTypes.APPLICATION_M3U8)
                // .setSubtitleConfigurations(Collections.singletonList(subtitleConfiguration))
                .setSubtitleConfigurations(subtitleConfigurations)
                .setDrmConfiguration(new MediaItem.DrmConfiguration.Builder(C.CLEARKEY_UUID).build())
                // .setAdsConfiguration(new
                // MediaItem.AdsConfiguration.Builder(adTagUri).build())
                .build();

        player.setMediaItem(mediaItem);
        player.prepare();
        player.setRepeatMode(Player.REPEAT_MODE_ONE);

        player.play();
        fireVideoEvents("loadstart");
        updateButtonVisibility();
    }

    private void updateButtonVisibility() {
        selectTracksButton.setEnabled(player != null && TrackSelectionDialog.willHaveContent(player));
    }

    private void handlePlayerError(PlaybackException error) {
        if (error.errorCode == PlaybackException.ERROR_CODE_BEHIND_LIVE_WINDOW) {
            player.seekToDefaultPosition();
            player.prepare();
        } else {
            updateButtonVisibility();
            showToast("Playback Error: " + error.getMessage());
        }
    }

    private void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }


    @Override
    protected void onResume() {
        super.onResume();
        if (!player.isPlaying()) {
            player.play();
        }
        // registerReceiver(pipActionReceiver, new IntentFilter("MEDIA_CONTROL"));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) { // Android 13 and later
            registerReceiver(pipActionReceiver, new IntentFilter("MEDIA_CONTROL"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(pipActionReceiver, new IntentFilter("MEDIA_CONTROL"));
        }

    }

    @Override
    protected void onPause() {
        super.onPause();
        if (player.isPlaying()) {
            player.pause();
        }
    }



    private void updatePlayPauseButton(boolean isPlaying) {
        this.isPlaying = isPlaying;
        playPauseButton.setImageResource(isPlaying ? R.drawable.pause : R.drawable.play);
    }

    private void updateSeekBar() {
        long duration = player.getDuration();
        long currentPosition = player.getCurrentPosition();

        seekBar.setMax((int) duration);
        seekBar.setProgress((int) currentPosition);

        String elapsedTime = formatTime(currentPosition);
        String totalTime = formatTime(duration);

        seekBar.setContentDescription(elapsedTime + " / " + totalTime);

        currentTimeTextView = findViewById(R.id.currentTimeTextView);
        currentTimeTextView.setText(elapsedTime);

        totalTimeTextView = findViewById(R.id.totalTimeTextView);
        totalTimeTextView.setText(totalTime);
    }

    private String formatTime(long timeMs) {
        long totalSeconds = timeMs / 1000;
        long seconds = totalSeconds % 60;
        long minutes = (totalSeconds / 60) % 60;
        long hours = totalSeconds / 3600;

        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, seconds);
        } else {
            return String.format("%02d:%02d", minutes, seconds);
        }
    }

    private void togglePlayPause() {
        if (isPlaying) {
            player.pause();
            playPauseButton.setImageResource(R.drawable.play);
        } else {
            player.play();
            playPauseButton.setImageResource(R.drawable.pause);
        }
        isPlaying = !isPlaying; // Toggle the playing state

        // Update Picture-in-Picture parameters to reflect the current state
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            updatePictureInPictureParams();
        }
    }

    private void toggleMute() {
    if (isMuted) {
        player.setVolume(1f);
        muteButton.setImageResource(R.drawable.unmutenw);
    } else {
        player.setVolume(0f);
        muteButton.setImageResource(R.drawable.mutenw);
    }
    isMuted = !isMuted;
}

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(pipActionReceiver);

        try {
            playerView.getPlayer().stop();
            handler.removeCallbacks(updateSeekBarRunnable);
            playerView.getPlayer().release();

            try {

                WritableMap map = Arguments.createMap();
                map.putString("key2", resumePos);
                try {
                    getReactInstanceManager().getCurrentReactContext()
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("fun1", map);

                } catch (Exception e) {
                    Log.e("ReactNative", "Caught Exception: " + e.getMessage());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private void vidoeeventfire(String url) {
        try {
            if (player == null) {
                return;
            }

            long videoLength = (long) player.getDuration();
            url = url + "&videoLength=" + videoLength + "&did=" + mediaParams.downloadID + "&session=" + sessionID;

            logMessage("VideoEventFire", url);

            // Assuming fireVideoTracking is your method to send the URL request
            fireVideoTracking(url);
        } catch (Exception e) {
            logMessage("VideoEventFire", "Event error: " + e.getMessage());
        }
    }

    void logMessage(String tag, String msg) {
        try {
            if (BuildConfig.DEBUG) {
                System.out.println(tag + " :: " + msg);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void fireVideoTracking(String url) {

        try {

            WritableMap map = Arguments.createMap();
            map.putString("key1", url);
            try {
                getReactInstanceManager().getCurrentReactContext()
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("fun1", map);

            } catch (Exception e) {
                Log.e("ReactNative", "Caught Exception: " + e.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    String resumePos = "0";

    private void timeupdateEvent() {
        try {
            if (player == null || !player.isPlaying()) {
                return;
            }

            elapsedTime++;

            long currentTime = player.getCurrentPosition() / 1000;

            if (currentTime % 6 == 0) {
                if (currentTime > maxWatchedTime) {
                    maxWatchedTime = currentTime;
                }
                String videoCurrentPlayingTime = currentTime + "";
                resumePos = videoCurrentPlayingTime;
                // setCurrentPlayingResumeVal(videoCurrentPlayingTime);

                String url = mediaParams.getVideoTrackingLink() + "&timeupdate=" + videoCurrentPlayingTime +
                        "&videoevent=timeupdate&maxWatchedTime=" + maxWatchedTime + "&totalWatchedTime=" + elapsedTime;
                vidoeeventfire(url);
            }

            long videoLength = player.getDuration() / 1000;

            logMessage("VideoEventFire - curr ", "" + currentTime + " : " + (0.25 * videoLength));

            if (currentTime >= Math.floor(0.25 * videoLength) && currentTime <= Math.ceil(0.25 * videoLength)) {
                logMessage("VideoEventFire - ", "Complete 25% of video length");
                sendAnalytics("video_event", "action", "complete 25% of video");
            }

            if (currentTime >= (0.5 * videoLength) && currentTime <= (0.5 * videoLength)) {
                logMessage("VideoEventFire - ", "Complete 50% of video length");
                sendAnalytics("video_event", "action", "complete 50% of video");
            }

            if (currentTime >= (0.75 * videoLength) && currentTime <= (0.75 * videoLength)) {
                logMessage("VideoEventFire - ", "Complete 75% of video length");
                sendAnalytics("video_event", "action", "complete 75% of video");
            }

            if (currentTime >= videoLength - 1) {
                logMessage("VideoEventFire - ", "Complete 100% of video length");
                sendAnalytics("video_event", "action", "complete 100% of video");
                if (onVideoEnd) {
                    player = null;
                }
            }
        } catch (Exception e) {
            logMessage("TimeupdateEvent", "Error: " + e.getMessage());
        }
    }

    private final Handler handler = new Handler();
    private Runnable analyticsTimerRunnable;

    private void startAnalyticsTimer() {
        analyticsTimerRunnable = new Runnable() {
            @Override
            public void run() {
                System.out.println("timerrrr");
                timeupdateEvent();
                handler.postDelayed(this, 1000);
            }
        };

        handler.post(analyticsTimerRunnable);
    }

    private void fireVideoEvents(String action) {
        try {

            String url = "";

            if (action.equals("ended")) {
                url = mediaParams.getVideoTrackingLink() + "&videoevent=ended&ended=1";
                vidoeeventfire(url);
                sendAnalytics("video_event", "action", "ended");
            } else if (action.equals("loadstart")) {
                url = mediaParams.getVideoTrackingLink() + "&videoevent=loadstart&loadstart=1";
                vidoeeventfire(url);
                sendAnalytics("video_event", "action", "loadstart");
            } else if (action.equals("play")) {
                url = mediaParams.getVideoTrackingLink() + "&videoevent=play&play=1";
                vidoeeventfire(url);
                startAnalyticsTimer();
                sendAnalytics("video_event", "action", "videoplay");
            } else if (action.equals("pause")) {
                url = mediaParams.getVideoTrackingLink() + "&videoevent=pause&pause=1";
                vidoeeventfire(url);
                pauseTimer();
                sendAnalytics("video_event", "action", "videopause");
            }
        } catch (Exception e) {
            logMessage("VideoPlayer", "Error in fireVideoEvents: " + e.getMessage());
        }
    }

    private void pauseTimer() {
        if (handler != null && analyticsTimerRunnable != null) {
            handler.removeCallbacks(analyticsTimerRunnable);
        }
    }

    public void sendAnalytics(String eventKey, String action, String value) {

    }

}