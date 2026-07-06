package com.ERP.QMS.repository;

import com.ERP.QMS.model.User;
import com.ERP.QMS.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(String usernameOrEmail, String usernameOrEmail2);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByActiveTrue();
    List<User> findByRole(UserRole role);
    List<User> findByDepartmentId(Long departmentId);
}
