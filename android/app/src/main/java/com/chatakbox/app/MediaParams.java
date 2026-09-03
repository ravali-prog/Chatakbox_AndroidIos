package com.chatakbox.app;



import org.json.JSONObject;

import java.io.Serializable;

public class MediaParams implements Serializable {

    String mediaUrl;
    String videoTitle;
    String downloadID;
    String resume;
    String subtitle;

    String videoTrackingLink;

    private static final long serialVersionUID = 1L;

    public MediaParams(String mediaUrl, String videoTitle, String downloadID, String resume, String subtitle,String videoTrackingLink) {
        this.mediaUrl = mediaUrl;
        this.videoTitle = videoTitle;
        this.downloadID = downloadID;
        this.resume = resume;
        this.subtitle = subtitle;
        this.videoTrackingLink= videoTrackingLink;
    }

    public JSONObject getSubtitleObject(){
        try{
            JSONObject subTitleObject= new JSONObject(subtitle);
            return subTitleObject;

        }catch(Exception e){
            e.printStackTrace();

        }
        return null;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getVideoTitle() {
        return videoTitle;
    }

    public void setVideoTitle(String videoTitle) {
        this.videoTitle = videoTitle;
    }

    public String getDownloadID() {
        return downloadID;
    }

    public void setDownloadID(String downloadID) {
        this.downloadID = downloadID;
    }

    public String getResume() {
        return resume;
    }

    public Integer getResumeNumber() {
        try{
            return  Integer.parseInt(resume);

        }catch (Exception e){

        }
        return 0;
    }

    public void setResume(String resume) {
        this.resume = resume;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getVideoTrackingLink() {
        return videoTrackingLink;
    }

    public void setVideoTrackingLink(String videoTrackingLink) {
        this.videoTrackingLink = videoTrackingLink;
    }
}