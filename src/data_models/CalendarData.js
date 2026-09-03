import React, { useState } from "react";
import { Modal, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";


const CalendarDialog = ({ showDialog, setShowDialog, value, updateProfile }) => {
    const [selectedDate, setSelectedDate] = useState(value || "Select Date");


    const handleDateChange = (event, date) => {
        if (event.type === "set" && date && date !== "" && date !== null) { // Check if date is not undefined and event type is "set"
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' }; // Specify date format options
            const selectedDate = date.toLocaleDateString('en-CA', options); // Convert date to string in desired format (en-CA locale ensures YYYY-MM-DD format)
            updateProfile(selectedDate, 'dob');
            setSelectedDate(selectedDate);
            setShowDialog(false);
        }
        else if (event.type === "dismissed") { // Check if event type is "dismissed" (cancel)
            setSelectedDate(selectedDate);
            setShowDialog(false); // Close the dialog without performing any action
        }
    };
    
    

    return (
        <>
            {showDialog && (
                <RNDateTimePicker
                    value={selectedDate == "Select Date" ? new Date() : new Date(selectedDate)}
                    mode="date"
                    onChange={(event, date) => {
                        handleDateChange(event, date)
                    }}

                />)
            }
        </>

    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        marginTop: 10,
    },
    button: {
        backgroundColor: "#DFA924",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    buttonText: {
        color: "black",
        textAlign: "center",
    },
    message: {
        color: '#fff',
        marginBottom: 20,
        fontSize: 16,
        textAlign: 'center',
    },
});


export default CalendarDialog;