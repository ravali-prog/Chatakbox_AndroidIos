import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Razorpay from "react-native-customui";


export default function SubscriptionPaymentTest() { 
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const googlePayPackage = "com.google.android.apps.nbu.paisa.user";
    setSelectedPackage(googlePayPackage);
  }, []);

  const handlePayment = () => {
    if (!selectedPackage) {
      alert("Google Pay not installed!");
      return;
    }

    const options = {
      currency: "INR",
      amount: "29900",
      key_id: "rzp_live_BEApePi5TAdmSR",
      method: "upi",
              description: "Quarterly",
      subscription_id:"sub_RhyxQhILLJ0AI7",
    //   upi_app_package_name: selectedPackage, 
      "_[flow]": "intent",
//      order_id: "",
       
    notes: {
    reference_id: "NTk1MjQwfDExOS0xLTUwfDEwMXwyfDE0OA==",
    uuid: "ak2nn-4c65f-2a55f-eba9f",
  },
   contact: "+917978924868",
    email: "support@vhunt.in"
    };



    Razorpay.open(options)
      .then((data) => {
        alert("Success: " + JSON.stringify(data));
      })
      .catch((error) => {
        alert("Failed: " + JSON.stringify(error));
      });
  };

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.title}>Subscribe now and{"\n"}start streaming</Text> */}

      {/* <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>Key Feature</Text>

        <Text style={styles.featureText}>• Movies, Shows, web series, documentaries, short movies etc.</Text>
        <Text style={styles.featureText}>• Ad-free movies & shows</Text>
        <Text style={styles.featureText}>• Connect up to 5 devices</Text>
        <Text style={styles.featureText}>• Get HD resolution up to 1080p</Text>
      </View> */}

      {/* {renderPlan("week", "Week", 42, 70, "40% off")}
      {renderPlan("month", "Month", 149, 309, "50% off", true)}
      {renderPlan("year", "Year", 799, 2090, "60% off")} */}

      <View style={styles.payRow}>
        {/* <Text style={styles.payVia}>Pay Via</Text> */}

        <View style={styles.phonePeRow}>
          {/* <Text style={styles.phonePeText}>
            {selectedPackage === "com.google.android.apps.nbu.paisa.user"
              ? "Google Pay"
              : "Not Found"}
          </Text> */}
        </View>
      </View>

      <TouchableOpacity style={styles.proceedBtn} onPress={handlePayment}>
        <Text style={styles.proceedText}>PROCEED</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const renderPlan = (id, title, price, oldPrice, discount, highlight = false) => (
  <TouchableOpacity
    style={[
      styles.planCard,
      highlight && styles.highlightCard,
    ]}
  >
    <View style={styles.leftRow}>
      <View style={styles.radioOuter}>
        {highlight && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.planLabel}>{title}</Text>
    </View>

    <View style={styles.rightRow}>
      <Text style={styles.price}>₹{price}</Text>
      <Text style={styles.oldPrice}>₹{oldPrice}</Text>

      <View
        style={[
          styles.discountBadge,
          highlight && styles.discountBadgeRed,
        ]}
      >
        <Text style={styles.discountText}>{discount}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  featureBox: {
    backgroundColor: "#b80000",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
  },
  featureTitle: {
    color: "yellow",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  featureText: {
    color: "#fff",
    fontSize: 14,
    marginVertical: 3,
  },
  planCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#181818",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  highlightCard: {
    borderColor: "#ff0000",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff4444",
  },
  planLabel: { color: "#fff", fontSize: 16 },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  oldPrice: {
    color: "#777",
    textDecorationLine: "line-through",
    marginLeft: 6,
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: "#555",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  discountBadgeRed: {
    backgroundColor: "#ff0000",
  },
  discountText: { color: "#fff", fontSize: 12 },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    alignItems: "center",
  },
  payVia: { color: "#fff", fontSize: 14 },
  phonePeRow: { flexDirection: "row", alignItems: "center" },
  phonePeIcon: { fontSize: 20, marginRight: 5 },
  phonePeText: { color: "#fff", fontSize: 16 },
  proceedBtn: {
    backgroundColor: "#d60000",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },
  proceedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
