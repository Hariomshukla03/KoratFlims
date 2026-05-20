import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';
import {fonts} from '../../utils/fonts';

const {width, height} = Dimensions.get('window');

const StartupAnimation = ({onFinish}) => {
  // KR Logo — drops from above
  const krY = useRef(new Animated.Value(-120)).current;
  const krOpacity = useRef(new Animated.Value(0)).current;

  // Brand name — fades + scales
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameScale = useRef(new Animated.Value(0.82)).current;

  // Tagline — fades in after name
  const tagOpacity = useRef(new Animated.Value(0)).current;

  // Underline — draws left → right
  const lineW = useRef(new Animated.Value(0)).current;

  // Clapper — rises from below
  const clapY = useRef(new Animated.Value(160)).current;
  const clapOpacity = useRef(new Animated.Value(0)).current;

  // Flap rotation (open → slam shut)
  const flapRot = useRef(new Animated.Value(-52)).current;

  // Shake on slam
  const shakeX = useRef(new Animated.Value(0)).current;

  // Orange flash
  const flash = useRef(new Animated.Value(0)).current;

  // Final exit
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // ① KR logo drops in
      Animated.parallel([
        Animated.timing(krOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(krY, {
          toValue: 0,
          speed: 12,
          bounciness: 9,
          useNativeDriver: true,
        }),
      ]),

      // ② Brand name fades + scales in
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(nameScale, {
          toValue: 1,
          speed: 13,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]),

      // ③ Underline draws in
      Animated.delay(40),
      Animated.timing(lineW, {
        toValue: width * 0.78,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),

      // ④ Tagline fades
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // ⑤ Clapperboard rises from bottom
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(clapOpacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(clapY, {
          toValue: 0,
          speed: 12,
          bounciness: 7,
          useNativeDriver: true,
        }),
      ]),

      // ⑥ Flap SLAMS shut
      Animated.delay(220),
      Animated.parallel([
        Animated.spring(flapRot, {
          toValue: 0,
          speed: 26,
          bounciness: 2,
          useNativeDriver: true,
        }),
        // flash
        Animated.sequence([
          Animated.timing(flash, {
            toValue: 0.28,
            duration: 55,
            useNativeDriver: true,
          }),
          Animated.timing(flash, {
            toValue: 0,
            duration: 240,
            useNativeDriver: true,
          }),
        ]),
        // shake
        Animated.sequence([
          Animated.timing(shakeX, {
            toValue: 8,
            duration: 40,
            useNativeDriver: true,
          }),
          Animated.timing(shakeX, {
            toValue: -8,
            duration: 40,
            useNativeDriver: true,
          }),
          Animated.timing(shakeX, {
            toValue: 5,
            duration: 36,
            useNativeDriver: true,
          }),
          Animated.timing(shakeX, {
            toValue: -3,
            duration: 36,
            useNativeDriver: true,
          }),
          Animated.timing(shakeX, {
            toValue: 0,
            duration: 30,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // ⑦ Hold → cinematic fade out
      Animated.delay(900),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 520,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish && onFinish();
    });
  }, []);

  const flapRotDeg = flapRot.interpolate({
    inputRange: [-52, 0],
    outputRange: ['-52deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.root, {opacity: exitOpacity}]}>
      {/* ═══ KR LOGO — TOP ═══ */}
      <Animated.Image
        source={require('/KoratFlims/assets/Images/KR.png')}
        style={[
          styles.krLogo,
          {
            opacity: krOpacity,
            transform: [{translateY: krY}],
          },
        ]}
        resizeMode="contain"
      />

      {/* ═══ BRAND NAME — MIDDLE ═══ */}
      <Animated.View
        style={[
          styles.nameBlock,
          {
            opacity: nameOpacity,
            transform: [{scale: nameScale}],
          },
        ]}>
        <Animated.Image
          source={require('/KoratFlims/assets/Images/KORATFilms.png')}
          style={styles.nameLogo}
          resizeMode="contain"
        />
        {/* animated underline */}
        <Animated.View style={[styles.underline, {width: lineW}]} />

        {/* tagline */}
      </Animated.View>

      {/* ═══ CLAPPERBOARD — BOTTOM ═══ */}
      <Animated.View
        style={[
          styles.clapWrap,
          {
            opacity: clapOpacity,
            transform: [{translateY: clapY}, {translateX: shakeX}],
          },
        ]}>
        {/* ── Flap (top, rotates) ── */}
        <Animated.View
          style={[
            styles.flap,
            {
              transform: [
                {translateX: -(width * 0.44)}, // pivot left edge
                {rotate: flapRotDeg},
                {translateX: width * 0.44},
              ],
            },
          ]}>
          {[...Array(9)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.flapStripe,
                {backgroundColor: i % 2 === 0 ? '#F05A28' : '#111'},
              ]}
            />
          ))}
          {/* small hinge nub */}
          <View style={styles.hingeLeft} />
          <View style={styles.hingeRight} />
        </Animated.View>

        {/* ── Body ── */}
        <View style={styles.body}>
          {/* top stripe row */}
          <View style={styles.bodyTopStripes}>
            {[...Array(9)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.bodyStripe,
                  {backgroundColor: i % 2 === 0 ? '#F05A28' : '#111'},
                ]}
              />
            ))}
          </View>

          {/* info rows */}
          <View style={styles.infoWrap}>
            {/* row 1 */}
            <View style={styles.infoRow}>
              <View style={styles.infoCell}>
                <Text style={styles.infoLabel}>PRODUCTION</Text>
                <Text style={styles.infoValue}>KORATFILMS</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            {/* row 2 */}
            <View style={styles.infoRow}>
              <View style={[styles.infoCell, {flex: 1}]}>
                <Text style={styles.infoLabel}>SCENE</Text>
                <Text style={styles.infoValue}>01</Text>
              </View>
              <View style={styles.infoDividerV} />
              <View style={[styles.infoCell, {flex: 1}]}>
                <Text style={styles.infoLabel}>TAKE</Text>
                <Text style={styles.infoValue}>01</Text>
              </View>
              <View style={styles.infoDividerV} />
              <View style={[styles.infoCell, {flex: 1}]}>
                <Text style={styles.infoLabel}>ROLL</Text>
                <Text style={styles.infoValue}>A</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ── Orange flash ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: '#F05A28', opacity: flash},
        ]}
      />
    </Animated.View>
  );
};

export default StartupAnimation;

const CLAP_W = width * 0.72;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },

  // ── KR Logo ──────────────────────────────────────
  krLogo: {
    width: 220,
    height: 220,
  },

  // ── Brand name ────────────────────────────────────
  nameBlock: {
    alignItems: 'center',
  },
  nameLogo: {
    width: width * 0.82,
    height: 88,
    marginTop: -80,
  },
  underline: {
    height: 3,
    backgroundColor: '#F05A28',
    borderRadius: 2,
    marginTop: 7,
    shadowColor: '#F05A28',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.55,
    shadowRadius: 6,
    elevation: 4,
  },
  tagline: {
    marginTop: 9,
    fontSize: 9,
    color: '#BBBBBB',
    letterSpacing: 3.2,
    fontFamily: fonts.semiBold,
  },

  // ── Clapperboard ──────────────────────────────────
  clapWrap: {
    width: CLAP_W,
    alignItems: 'flex-start',
    marginTop: 8,
    // subtle card shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },

  // Flap
  flap: {
    width: CLAP_W,
    height: 26,
    flexDirection: 'row',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  flapStripe: {
    flex: 1,
    height: '100%',
  },
  hingeLeft: {
    position: 'absolute',
    left: 10,
    top: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#555',
    borderWidth: 2,
    borderColor: '#888',
  },
  hingeRight: {
    position: 'absolute',
    right: 10,
    top: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#555',
    borderWidth: 2,
    borderColor: '#888',
  },

  // Body
  body: {
    width: CLAP_W,
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderTopWidth: 0,
  },
  bodyTopStripes: {
    flexDirection: 'row',
    height: 18,
    borderBottomWidth: 1,
    borderColor: '#2C2C2E',
  },
  bodyStripe: {
    flex: 1,
  },

  infoWrap: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCell: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 6,
  },
  infoDividerV: {
    width: 1,
    height: 36,
    backgroundColor: '#2C2C2E',
  },
  infoLabel: {
    fontSize: 7.5,
    color: '#666',
    letterSpacing: 2,
    fontFamily: fonts.bold,
  },
  infoValue: {
    fontSize: 13,
    color: '#F05A28',
    fontFamily: fonts.bold,
    letterSpacing: 1.2,
    marginTop: 2,
  },
});
