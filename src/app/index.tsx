import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getLocation();
    startPulse();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getLocation = async () => {
    try {
      setError(null);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setError("Location permission denied");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation.coords);
      setLoading(false);
      setRefreshing(false);
      animateIn();
    } catch (e) {
      setError("Failed to get location. Please try again.");
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(40);
    cardScale.setValue(0.92);
    getLocation();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderInner}>
          <View style={styles.radarRing}>
            <View style={styles.radarRingInner}>
              <ActivityIndicator size="large" color="#00F5A0" />
            </View>
          </View>
          <Text style={styles.loaderTitle}>Smart Geo Finder</Text>
          <Text style={styles.loaderSub}>Acquiring your position...</Text>
          <View style={styles.loaderDots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const mapURL = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=16&output=embed`;

  return (
    <View style={styles.container}>
      {/* Background decorative circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.headerTopRow}>
            <View style={styles.liveBadge}>
              <Animated.View
                style={[
                  styles.liveDot,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
              <Text style={styles.refreshIcon}>⟳</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.appTitle}>Smart Geo Finder</Text>
          <Text style={styles.appSubtitle}>Your real-time location intelligence</Text>
        </Animated.View>

        {/* Coordinates Card */}
        <Animated.View
          style={[
            styles.coordCard,
            {
              transform: [
                { translateY: slideAnim },
                { scale: cardScale },
              ],
            },
          ]}
        >
          <View style={styles.coordCardHeader}>
            <View style={styles.coordIconWrap}>
              <Text style={styles.coordIcon}>📍</Text>
            </View>
            <Text style={styles.coordCardTitle}>Current Coordinates</Text>
          </View>

          <View style={styles.coordRow}>
            <View style={styles.coordBlock}>
              <Text style={styles.coordLabel}>LATITUDE</Text>
              <Text style={styles.coordValue}>
                {location.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordUnit}>° N</Text>
            </View>
            <View style={styles.coordDivider} />
            <View style={styles.coordBlock}>
              <Text style={styles.coordLabel}>LONGITUDE</Text>
              <Text style={styles.coordValue}>
                {location.longitude.toFixed(6)}
              </Text>
              <Text style={styles.coordUnit}>° E</Text>
            </View>
          </View>

          {location.altitude !== null && location.altitude !== undefined && (
            <View style={styles.altitudeRow}>
              <Text style={styles.altitudeLabel}>🏔 Altitude</Text>
              <Text style={styles.altitudeValue}>
                {location.altitude.toFixed(1)} m
              </Text>
            </View>
          )}

          {location.accuracy !== null && location.accuracy !== undefined && (
            <View style={styles.accuracyBar}>
              <Text style={styles.accuracyLabel}>Accuracy</Text>
              <View style={styles.accuracyTrack}>
                <View
                  style={[
                    styles.accuracyFill,
                    {
                      width: `${Math.min(
                        100,
                        100 - Math.min(location.accuracy, 100)
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.accuracyValue}>
                ±{location.accuracy.toFixed(0)}m
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          style={[
            styles.statsRow,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {[
            { icon: "🌐", label: "GPS", value: "Active" },
            { icon: "📶", label: "Signal", value: "Strong" },
            { icon: "🛰", label: "Satellites", value: "12+" },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Map */}
        <Animated.View
          style={[
            styles.mapCard,
            {
              transform: [
                { translateY: slideAnim },
                { scale: cardScale },
              ],
            },
          ]}
        >
          <View style={styles.mapCardHeader}>
            <Text style={styles.mapCardTitle}>📡 Live Map View</Text>
            <View style={styles.mapBadge}>
              <Text style={styles.mapBadgeText}>Google Maps</Text>
            </View>
          </View>

          {Platform.OS === "web" ? (
            <View style={styles.mapWrapper}>
              <iframe
                src={mapURL}
                width="100%"
                height="380"
                style={{
                  border: "none",
                  borderRadius: "16px",
                  display: "block",
                }}
                loading="lazy"
                allowFullScreen
              />
              <View style={styles.mapOverlayCorner}>
                <Text style={styles.mapOverlayText}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.mobileMapNote}>
              <Text style={styles.mobileMapIcon}>📱</Text>
              <Text style={styles.mobileMapText}>
                Open in Expo Go on mobile to view the live map
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by Expo Location API · Updated just now
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B18",
  },

  // Background decorations
  bgCircle1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#00F5A015",
    top: -100,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#0061FF10",
    bottom: 200,
    left: -60,
  },
  bgCircle3: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FF6B3510",
    bottom: 80,
    right: 30,
  },

  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00F5A020",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#00F5A040",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#00F5A0",
    marginRight: 6,
  },
  liveBadgeText: {
    color: "#00F5A0",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF10",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF15",
  },
  refreshIcon: {
    color: "#FFFFFF80",
    fontSize: 20,
    fontWeight: "300",
  },
  appTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#FFFFFF50",
    letterSpacing: 0.3,
  },

  // Coordinates Card
  coordCard: {
    backgroundColor: "#0E1830",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF10",
    shadowColor: "#00F5A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  coordCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  coordIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#00F5A015",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  coordIcon: {
    fontSize: 20,
  },
  coordCardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  coordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  coordBlock: {
    flex: 1,
    alignItems: "center",
  },
  coordDivider: {
    width: 1,
    height: 70,
    backgroundColor: "#FFFFFF15",
    marginHorizontal: 8,
  },
  coordLabel: {
    fontSize: 10,
    color: "#FFFFFF40",
    letterSpacing: 2.5,
    fontWeight: "700",
    marginBottom: 8,
  },
  coordValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#00F5A0",
    letterSpacing: -0.5,
  },
  coordUnit: {
    fontSize: 11,
    color: "#FFFFFF40",
    marginTop: 4,
    letterSpacing: 1,
  },
  altitudeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF08",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  altitudeLabel: {
    color: "#FFFFFF60",
    fontSize: 13,
  },
  altitudeValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  accuracyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accuracyLabel: {
    color: "#FFFFFF40",
    fontSize: 11,
    letterSpacing: 1,
    width: 60,
  },
  accuracyTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#FFFFFF15",
    borderRadius: 2,
    overflow: "hidden",
  },
  accuracyFill: {
    height: "100%",
    backgroundColor: "#00F5A0",
    borderRadius: 2,
  },
  accuracyValue: {
    color: "#00F5A0",
    fontSize: 11,
    fontWeight: "700",
    width: 44,
    textAlign: "right",
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#0E1830",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF08",
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    color: "#FFFFFF40",
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // Map Card
  mapCard: {
    backgroundColor: "#0E1830",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF10",
  },
  mapCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  mapCardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  mapBadge: {
    backgroundColor: "#0061FF20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0061FF40",
  },
  mapBadgeText: {
    color: "#5599FF",
    fontSize: 11,
    fontWeight: "700",
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  mapOverlayCorner: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#050B18CC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF15",
  },
  mapOverlayText: {
    color: "#00F5A0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  mobileMapNote: {
    backgroundColor: "#FFFFFF05",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  mobileMapIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  mobileMapText: {
    color: "#FFFFFF50",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    backgroundColor: "#050B18",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loaderInner: {
    alignItems: "center",
  },
  radarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#00F5A030",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  radarRingInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#00F5A060",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  loaderSub: {
    color: "#FFFFFF50",
    fontSize: 14,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  loaderDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00F5A0",
  },

  // Error
  errorCard: {
    backgroundColor: "#0E1830",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B3530",
    width: "100%",
    maxWidth: 340,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorText: {
    color: "#FFFFFF60",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: "#00F5A0",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryBtnText: {
    color: "#050B18",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  footerText: {
    color: "#FFFFFF25",
    fontSize: 11,
    letterSpacing: 0.5,
  },
});