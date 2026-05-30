import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useHortaStore } from '../../store/hortaStore';
import { PLANET_IMAGES } from '../../data/seed';

export function HeaderSelector() {
  const planetas = useHortaStore((s) => s.planetas);
  const hortas = useHortaStore((s) => s.hortas);
  const selectedPlanetaId = useHortaStore((s) => s.selectedPlanetaId);
  const selectedHortaId = useHortaStore((s) => s.selectedHortaId);
  const selectPlaneta = useHortaStore((s) => s.selectPlaneta);
  const selectHorta = useHortaStore((s) => s.selectHorta);

  const [showPlanetas, setShowPlanetas] = useState(false);
  const [showHortas, setShowHortas] = useState(false);

  const planeta = planetas.find((p) => p.id === selectedPlanetaId);
  const horta = hortas.find((h) => h.id === selectedHortaId);
  const hortasDoPlaneta = hortas.filter((h) => h.planetaId === selectedPlanetaId);

  return (
    <View style={styles.container}>
      {/* Seletor de Planeta */}
      <TouchableOpacity style={[styles.selector, { borderColor: planeta?.cor ?? COLORS.border }]} onPress={() => setShowPlanetas(true)}>
        {planeta && PLANET_IMAGES[planeta.id]
          ? <Image source={PLANET_IMAGES[planeta.id]} style={styles.planetImgSmall} resizeMode="contain" />
          : <View style={[styles.dot, { backgroundColor: planeta?.cor ?? COLORS.border }]} />
        }
        <Text style={styles.selectorText} numberOfLines={1}>{planeta?.nome ?? '—'}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Text style={styles.sep}>·</Text>

      {/* Seletor de Horta */}
      <TouchableOpacity style={styles.selector} onPress={() => setShowHortas(true)}>
        <Text style={styles.selectorText} numberOfLines={1}>{horta?.nome ?? '—'}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      {/* Modal Planetas */}
      <Modal visible={showPlanetas} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowPlanetas(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Selecionar Planeta</Text>
            <FlatList
              data={planetas}
              keyExtractor={(p) => p.id}
              renderItem={({ item: p }) => (
                <TouchableOpacity
                  style={[styles.dropdownItem, p.id === selectedPlanetaId && styles.dropdownItemActive]}
                  onPress={() => { selectPlaneta(p.id); setShowPlanetas(false); }}
                >
                  {PLANET_IMAGES[p.id]
                    ? <Image source={PLANET_IMAGES[p.id]} style={styles.planetImgDropdown} resizeMode="contain" />
                    : <View style={[styles.dot, { backgroundColor: p.cor }]} />
                  }
                  <View>
                    <Text style={styles.dropdownItemText}>{p.nome}</Text>
                    <Text style={styles.dropdownItemSub}>{p.gravidade.toFixed(2)} g</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Hortas */}
      <Modal visible={showHortas} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowHortas(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Selecionar Estufa</Text>
            <FlatList
              data={hortasDoPlaneta}
              keyExtractor={(h) => h.id}
              renderItem={({ item: h }) => (
                <TouchableOpacity
                  style={[styles.dropdownItem, h.id === selectedHortaId && styles.dropdownItemActive]}
                  onPress={() => { selectHorta(h.id); setShowHortas(false); }}
                >
                  <Text style={styles.dropdownItemText}>{h.nome}</Text>
                  <Text style={styles.dropdownItemSub}>{h.planta.especie} · {h.planta.fase}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    maxWidth: 150,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  planetImgSmall: { width: 20, height: 20, borderRadius: 10 },
  planetImgDropdown: { width: 36, height: 36, borderRadius: 18 },
  selectorText: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1 },
  chevron: { color: COLORS.textSecondary, fontSize: 10 },
  sep: { color: COLORS.textDim, fontSize: 16 },
  overlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'center', paddingHorizontal: 24 },
  dropdown: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 320,
  },
  dropdownTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
  },
  dropdownItemActive: { backgroundColor: COLORS.highlight },
  dropdownItemText: { color: COLORS.text, fontSize: 14 },
  dropdownItemSub: { color: COLORS.textSecondary, fontSize: 11 },
});
