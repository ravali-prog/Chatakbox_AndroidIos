import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ContentScroller from '../widgets/ContentScroller';
import LayoutVariantB from '../widgets/LayoutVariantB';
import LayoutVariantA from '../widgets/LayoutVariantA';
import { handleNavigation} from '../../app_config/AppConstants';
import { ContentData } from '../../data_models/ContentDataTypes';


const ListRender = ({ item, index }: any) => {


    const navigation: any = useNavigation();
    const [contentList, setContentList] = useState<ContentData[]>([]);
    const handleContainerPress = (index: any) => {
        const itemclicked = contentList[index]
        handleNavigation(navigation, itemclicked)
    };

    if (item.container == "scroller") {
        return (
            <View style={{ backgroundColor: '#000000',marginStart:-5 }} >
                {item.list && <ContentScroller prop={item.list} imgratio={{ imgper: item.imgper, imghratio: item.imghratio, imgwratio: item.imgwratio }} ></ContentScroller>}
                {item.clips && <ContentScroller prop={item.clips} imgratio={{ imgper: item.imgper, imghratio: item.imghratio, imgwratio: item.imgwratio }}></ContentScroller>}
            </View>
        )
    } else if (item.container == "item") {

        if (item.rendertype == "37") {
            return (
                <View style={{ backgroundColor: '#000000' }} >
                    <LayoutVariantA
                        listIndex={index}
                        onClick={handleContainerPress}
                        dataitem={{
                            title: item.title,
                            genre: item.genre,
                            lang: item.lang,
                            certificate: item.certificate,
                            rating: item.rating,
                            year: item.year,
                            release_date: item.release_date,
                            desc: item.desc,
                            ldesc: item.ldesc,
                            type: item.type,
                        }}
                        image={item.thumbnail} imgratio={{ imgper: item.imgper, imghratio: item.imghratio, imgwratio: item.imgwratio }} />

                </View>
            )
        }
        else if (item.rendertype == "38") {
            return (
                <View style={{ backgroundColor: '#000000' }} >
                    <LayoutVariantB
                        listIndex={index}
                        onClick={handleContainerPress}
                        image={item.thumbnail} imgratio={{ imgper: item.imgper, imghratio: item.imghratio, imgwratio: item.imgwratio }} />

                </View>
            )
        } else {
            return null
        }


    } else {
        return null
    }
    // }
}

export default ListRender;