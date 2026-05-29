import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export interface AlertButton {
  label: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

export function CustomAlert({ visible, title, message, buttons = [], onClose }: Props) {
  const btns = buttons.length > 0
    ? buttons
    : [{ label: 'OK', onPress: onClose, style: 'default' as const }];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          {message && <Text style={s.message}>{message}</Text>}
          <View style={[s.btnRow, btns.length === 1 && s.btnRowSingle]}>
            {btns.map((btn, i) => {
              const isCanccel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              const color = isDestructive ? COLORS.critico : isCanccel ? COLORS.textSecondary : COLORS.ciano;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.btn,
                    btns.length === 1 ? s.btnFull : s.btnHalf,
                    !isCanccel && { backgroundColor: color + '22', borderColor: color },
                    isCanccel && s.btnCancel,
                  ]}
                  onPress={() => { btn.onPress(); onClose(); }}
                  activeOpacity={0.75}
                >
                  <Text style={[s.btnText, { color }]}>{btn.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000CC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btnRowSingle: {
    justifyContent: 'flex-end',
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnHalf: { flex: 1 },
  btnFull: {},
  btnCancel: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.highlight,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
