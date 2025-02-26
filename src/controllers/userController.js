const User = require('../models/userModel');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const userId = await User.create(req.body);
    res.status(201).json({ message: '사용자가 생성되었습니다.', userId });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const result = await User.update(req.params.id, req.body);
    if (result === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.status(200).json({ message: '사용자 정보가 업데이트되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await User.delete(req.params.id);
    if (result === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.status(200).json({ message: '사용자가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
}; 