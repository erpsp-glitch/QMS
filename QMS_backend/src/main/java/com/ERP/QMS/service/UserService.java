package com.ERP.QMS.service;

import com.ERP.QMS.model.User;
import com.ERP.QMS.model.UserRole;
import com.ERP.QMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public List<User> getByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public User getById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    @Transactional
    public User create(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists: " + user.getUsername());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Transactional
    public User update(Long id, User updated) {
        User existing = getById(id);
        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setRole(updated.getRole());
        existing.setDepartment(updated.getDepartment());
        existing.setEmployeeCode(updated.getEmployeeCode());
        existing.setPhone(updated.getPhone());
        existing.setActive(updated.isActive());
        return userRepository.save(existing);
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        User user = getById(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
    }

    @Transactional
    public void toggleActive(Long id) {
        User user = getById(id);
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Transactional
    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
