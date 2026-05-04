import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { api, RelativeResponse } from '../../services/api';

type Relationship = 'parent' | 'spouse' | 'sibling' | 'child' | 'friend' | 'doctor' | 'other';

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: Relationship;
  isPrimary: boolean;
};

const RELATIONSHIPS: { value: Relationship; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'parent', label: 'Cha/Mẹ', icon: 'people' },
  { value: 'spouse', label: 'Vợ/Chồng', icon: 'heart' },
  { value: 'sibling', label: 'Anh/Chị/Em', icon: 'people-circle' },
  { value: 'child', label: 'Con', icon: 'person' },
  { value: 'friend', label: 'Bạn bè', icon: 'happy' },
  { value: 'doctor', label: 'Bác sĩ', icon: 'medical' },
  { value: 'other', label: 'Khác', icon: 'ellipsis-horizontal' },
];

const mapRelationship = (rel: string | null): Relationship => {
  if (!rel) return 'other';
  const lowerRel = rel.toLowerCase();
  if (lowerRel.includes('cha') || lowerRel.includes('mẹ') || lowerRel.includes('parent')) return 'parent';
  if (lowerRel.includes('vợ') || lowerRel.includes('chồng') || lowerRel.includes('spouse')) return 'spouse';
  if (lowerRel.includes('anh') || lowerRel.includes('chị') || lowerRel.includes('em') || lowerRel.includes('sibling')) return 'sibling';
  if (lowerRel.includes('con') || lowerRel.includes('child')) return 'child';
  if (lowerRel.includes('bạn') || lowerRel.includes('friend')) return 'friend';
  if (lowerRel.includes('bác sĩ') || lowerRel.includes('doctor')) return 'doctor';
  return 'other';
};

export default function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('parent');
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getRelatives();
      
      if (response && response.status === "success" && Array.isArray(response.data)) {
        const mappedContacts: EmergencyContact[] = response.data.map((r: RelativeResponse) => ({
          id: r.relative_id,
          name: r.contact_name,
          phone: r.phone_num,
          relationship: mapRelationship(r.relationship),
          isPrimary: r.is_primary, // Đảm bảo lấy đúng từ API
        }));
        setContacts(mappedContacts);
      } else {
        setContacts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchContacts();
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelationship('parent');
    setIsPrimary(false);
    setEditingContact(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setIsPrimary(contact.isPrimary);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!/^0\d{9,10}$/.test(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }

    setSaving(true);
    try {
      const relationshipLabel = RELATIONSHIPS.find(r => r.value === relationship)?.label || 'Khác';

      if (editingContact) {
        await api.updateRelative(editingContact.phone, {
          contact_name: name,
          relationship: relationshipLabel,
          is_primary: isPrimary, // Gửi trạng thái primary lên server
        });
      } else {
        await api.addRelative({
          phone_num: phone,
          contact_name: name,
          relationship: relationshipLabel,
          is_primary: isPrimary, // Gửi trạng thái primary khi thêm mới
        });
      }

      await fetchContacts();
      setModalVisible(false);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      Alert.alert('Lỗi', `Không thể lưu liên hệ: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (contact: EmergencyContact) => {
    Alert.alert(
      'Xóa liên hệ?',
      `Bạn có chắc muốn xóa ${contact.name} khỏi danh sách liên hệ khẩn cấp?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteRelative(contact.phone);
              await fetchContacts();
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Lỗi không xác định';
              Alert.alert('Lỗi', `Không thể xóa liên hệ: ${message}`);
            }
          },
        },
      ]
    );
  };

  const handleSetPrimary = async (contact: EmergencyContact) => {
    try {
      await api.updateRelative(contact.phone, { is_primary: true });
      
      setContacts((prev) =>
        prev.map((c) => ({
          ...c,
          isPrimary: c.id === contact.id,
        }))
      );
      
      console.log(`⭐ Đã đặt ${contact.name} làm liên hệ chính.`);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thay đổi liên hệ chính');
    }
  };

  const getRelationshipLabel = (rel: Relationship) => {
    return RELATIONSHIPS.find((r) => r.value === rel)?.label || 'Khác';
  };

  const renderContact = (contact: EmergencyContact) => (
    <View key={contact.id} style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactAvatarText}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.contactNameRow}>
            <Text style={styles.contactName}>{contact.name}</Text>
            {contact.isPrimary && (
              <View style={styles.primaryBadge}>
                <Ionicons name="star" size={10} color={Colors.neutral.white} />
                <Text style={styles.primaryBadgeText}>Chính</Text>
              </View>
            )}
          </View>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
          <Text style={styles.contactRelationship}>
            {getRelationshipLabel(contact.relationship)}
          </Text>
        </View>
      </View>

      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSetPrimary(contact)}
          disabled={contact.isPrimary}
        >
          <Ionicons
            name={contact.isPrimary ? 'star' : 'star-outline'}
            size={20}
            color={contact.isPrimary ? Colors.secondary.orange : Colors.neutral.placeholder}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(contact)}
        >
          <Ionicons name="create-outline" size={20} color={Colors.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(contact)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.status.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liên hệ khẩn cấp</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={Colors.primary.main} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Đang tải danh sách liên hệ...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="warning" size={20} color={Colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.infoBanner}>
            <Ionicons name="warning" size={24} color={Colors.status.error} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Cảnh báo SOS</Text>
              <Text style={styles.infoText}>
                Khi phát hiện bất thường và bạn không phản hồi trong 15 giây, hệ thống sẽ tự động gửi tin nhắn SOS đến các liên hệ dưới đây.
              </Text>
            </View>
          </View>

          {contacts.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                {contacts.length} liên hệ đã thêm
              </Text>
              {contacts.map(renderContact)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={48} color={Colors.neutral.placeholder} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có liên hệ nào</Text>
              <Text style={styles.emptyText}>
                Thêm liên hệ khẩn cấp để nhận thông báo SOS khi có sự cố
              </Text>
              <Button
                title="Thêm liên hệ đầu tiên"
                onPress={openAddModal}
                style={styles.emptyButton}
                leftIcon={<Ionicons name="add" size={18} color={Colors.neutral.white} />}
              />
            </View>
          )}

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Lưu ý quan trọng</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.status.success} />
              <Text style={styles.tipText}>Nên thêm ít nhất 2 liên hệ khẩn cấp</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.status.success} />
              <Text style={styles.tipText}>Liên hệ chính sẽ được gọi đầu tiên</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.status.success} />
              <Text style={styles.tipText}>Thông báo bao gồm vị trí GPS của bạn</Text>
            </View>
          </View>
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingContact ? 'Sửa liên hệ' : 'Thêm liên hệ'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Họ và tên"
                value={name}
                onChangeText={setName}
                placeholder="Nguyễn Văn A"
                leftIcon="person-outline"
                required
              />

              <Input
                label="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                placeholder="0901234567"
                leftIcon="call-outline"
                keyboardType="phone-pad"
                required
              />

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Mối quan hệ</Text>
                <View style={styles.relationshipContainer}>
                  {RELATIONSHIPS.map((rel) => (
                    <TouchableOpacity
                      key={rel.value}
                      style={[
                        styles.relationshipOption,
                        relationship === rel.value && styles.relationshipOptionSelected,
                      ]}
                      onPress={() => setRelationship(rel.value)}
                    >
                      <Ionicons
                        name={rel.icon}
                        size={18}
                        color={relationship === rel.value ? Colors.primary.main : Colors.neutral.placeholder}
                      />
                      <Text
                        style={[
                          styles.relationshipText,
                          relationship === rel.value && styles.relationshipTextSelected,
                        ]}
                      >
                        {rel.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryToggle}
                onPress={() => setIsPrimary(!isPrimary)}
              >
                <View style={styles.primaryToggleLeft}>
                  <Ionicons
                    name="star"
                    size={24}
                    color={isPrimary ? Colors.secondary.orange : Colors.neutral.placeholder}
                  />
                  <View>
                    <Text style={styles.primaryToggleTitle}>Liên hệ chính</Text>
                    <Text style={styles.primaryToggleSubtitle}>
                      Được ưu tiên thông báo khi có sự cố
                    </Text>
                  </View>
                </View>
                <View style={[styles.checkbox, isPrimary && styles.checkboxChecked]}>
                  {isPrimary && (
                    <Ionicons name="checkmark" size={14} color={Colors.neutral.white} />
                  )}
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalBottom}>
              <Button
                title={editingContact ? 'Lưu thay đổi' : 'Thêm liên hệ'}
                onPress={handleSave}
                loading={saving}
                size="lg"
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
  },
  errorBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.status.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.status.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.status.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.status.errorLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.status.error,
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.md,
  },
  contactCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactAvatarText: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.white,
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary.orange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 2,
  },
  primaryBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.white,
  },
  contactPhone: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textPrimary,
    marginTop: 2,
  },
  contactRelationship: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
    gap: Spacing.md,
  },
  actionButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
  },
  emptyText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyButton: {
    marginTop: Spacing.lg,
  },
  tipsCard: {
    backgroundColor: Colors.status.successLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.status.success,
    marginBottom: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  modalCancel: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary.main,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.sm,
  },
  relationshipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  relationshipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    backgroundColor: Colors.neutral.white,
    gap: Spacing.xs,
  },
  relationshipOptionSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.status.infoLight,
  },
  relationshipText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  relationshipTextSelected: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.medium,
  },
  primaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.sm,
  },
  primaryToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  primaryToggleTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.textPrimary,
  },
  primaryToggleSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  modalBottom: {
    paddingVertical: Spacing.lg,
  },
});
