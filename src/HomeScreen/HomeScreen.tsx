import React, { useCallback, useState } from 'react';
import { useContext } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../components/AuthContext';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Screen from '../components/Screen';
import Colors from '../modules/Colors';
import { Collections, RootStackParamList, User } from '../types';
import { useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.BLACK,
  },
  userSectionContent: {
    backgroundColor: Colors.BLACK,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  myProfile: {
    flex: 1,
  },
  myNameText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  myEmailText: {
    marginTop: 4,
    color: Colors.WHITE,
    fontSize: 14,
  },
  logoutText: {
    color: Colors.WHITE,
    fontSize: 14,
  },
  userListSection: {
    marginTop: 40,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userList: {
    flex: 1,
  },
  userListItem: {
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  otherNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  otherEmailText: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.BLACK,
  },
  separator: {
    height: 10,
  },
  emptyText: {
    color: Colors.BLACK,
  },
});

const HomeScreen = () => {
  const { user: me } = useContext(AuthContext);
  const [loadingUsers, setLoaodingUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { navigate } =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  console.log('users', users);

  const onPressLogout = useCallback(() => {
    auth().signOut();
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoaodingUsers(true);
      const snapshot = await firestore().collection(Collections.USERS).get();
      setUsers(
        snapshot.docs
          .map(doc => doc.data() as User)
          .filter(u => u.userId != me?.userId),
      );
    } finally {
      setLoaodingUsers(false);
    }
  }, [me?.userId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const renderLoading = useCallback(
    () => (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    ),
    [],
  );

  if (me == null) {
    return null;
  }

  return (
    <Screen title="홈">
      <View style={styles.container}>
        <View>
          <Text style={styles.sectionTitleText}>나의 정보</Text>
          <View style={styles.userSectionContent}>
            <View style={styles.myProfile}>
              <Text style={styles.myNameText}>{me.name}</Text>
              <Text style={styles.myEmailText}>{me.email}</Text>
            </View>
            <TouchableOpacity onPress={onPressLogout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.userListSection}>
          {loadingUsers ? (
            renderLoading()
          ) : (
            <>
              <Text style={styles.sectionTitleText}>
                다른 사용자와 대화해보세요!
              </Text>
              <FlatList
                style={styles.userList}
                data={users}
                renderItem={({ item: user }) => (
                  <TouchableOpacity
                    style={styles.userListItem}
                    onPress={() => {
                      navigate('Chat', {
                        userIds: [me.userId, user.userId],
                        other: user,
                      });
                    }}>
                    <View>
                      <Text style={styles.otherNameText}>{user.name}</Text>
                      <Text style={styles.otherEmailText}>{user.email}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={() => {
                  return (
                    <Text style={styles.emptyText}>사용자가 없습니다.</Text>
                  );
                }}
              />
            </>
          )}
        </View>
      </View>
    </Screen>
  );
};

export default HomeScreen;
