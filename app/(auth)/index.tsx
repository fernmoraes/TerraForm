import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import { useAppStore } from '../../store/appStore';
import { useHortaStore } from '../../store/hortaStore';
import { COLORS } from '../../constants/colors';

const SLIDES = [
  {
    emoji: '🚀',
    title: 'Bem-vindo ao TerraForm',
    body: 'Missão NASA / FIAP — Sistema de controle remoto para estufas herméticas no sistema solar. Você é o operador agrícola.',
  },
  {
    emoji: '🌌',
    title: 'Estufas Espaciais',
    body: 'Cada estufa é hermeticamente isolada do ambiente externo. O solo nativo do planeta não interfere. Apenas a gravidade afeta o cultivo.',
  },
  {
    emoji: '⚗️',
    title: 'Gestão de Recursos',
    body: '9 elementos brutos em galões (N, P, K, Ca, Mg, S, O, H, C). Sintetize compostos como H₂O, NH₃, CaCO₃ e H₂CO₃ para manter as condições ideais.',
  },
  {
    emoji: '📊',
    title: 'Monitoramento em Tempo Real',
    body: 'Acompanhe solo, atmosfera, nutrientes e fases de crescimento. O sistema consome recursos continuamente — mantenha os níveis adequados.',
  },
  {
    emoji: '✅',
    title: 'Missão Pronta',
    body: '5 planetas, 8 estufas operacionais. Boa missão, operador.',
  },
];

export default function Onboarding() {
  const [page, setPage] = useState(0);
  const completeTutorial = useAppStore((s) => s.completeTutorial);
  const tutorialCompleted = useAppStore((s) => s.tutorialCompleted);
  const resetSimulacao = useHortaStore((s) => s.resetSimulacao);
  const { alertVisible, alertTitle, alertMessage, alertButtons, showAlert, hideAlert } = useCustomAlert();
  const isReview = tutorialCompleted;
  const isLast = page === SLIDES.length - 1;
  const slide = SLIDES[page];

  const handleClose = () => router.back();

  const handleNext = () => {
    if (isLast) {
      if (!isReview) completeTutorial();
      isReview ? router.back() : router.replace('/(tabs)/estufa');
    } else {
      setPage((p) => p + 1);
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
      <View style={styles.skipRow}>
        {isReview ? (
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.skip}>✕ Fechar</Text>
          </TouchableOpacity>
        ) : (
          !isLast && (
            <TouchableOpacity onPress={() => setPage(SLIDES.length - 1)}>
              <Text style={styles.skip}>Pular</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>
          {isLast ? (isReview ? 'Fechar Tutorial' : 'Iniciar Missão') : 'Próximo'}
        </Text>
      </TouchableOpacity>

      {isReview && isLast && (
        <TouchableOpacity
          style={styles.tutorialBtn}
          onPress={() => router.push('/(auth)/tutorial')}
        >
          <Text style={styles.tutorialBtnText}>Tutorial Prático</Text>
        </TouchableOpacity>
      )}

      {isReview && isLast && (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() =>
            showAlert(
              'Reiniciar Simulação',
              'Todas as hortas voltarão ao estado inicial e os logs serão apagados. Confirmar?',
              [
                { label: 'Cancelar', onPress: () => {}, style: 'cancel' },
                {
                  label: 'Reiniciar',
                  style: 'destructive',
                  onPress: () => {
                    resetSimulacao();
                    router.replace('/(tabs)/estufa');
                  },
                },
              ]
            )
          }
        >
          <Text style={styles.resetText}>🔄 Reiniciar Simulação</Text>
        </TouchableOpacity>
      )}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onClose={hideAlert}
      />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 56, paddingBottom: 40 },
  skipRow: { height: 36, alignItems: 'flex-end' },
  skip: { color: COLORS.textSecondary, fontSize: 14 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 72, marginBottom: 28 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  body: { color: COLORS.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.highlight },
  dotActive: { backgroundColor: COLORS.ciano, width: 20 },
  btn: { backgroundColor: COLORS.ciano, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 17 },
  tutorialBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.ciano + '70',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  tutorialBtnText: { color: COLORS.ciano, fontSize: 15, fontWeight: '600' },
  resetBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.critico + '70',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  resetText: { color: COLORS.critico, fontSize: 15, fontWeight: '600' },
});
