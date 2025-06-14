package com.example.SWPP.service;

import com.example.SWPP.entity.Role;
import com.example.SWPP.entity.RolePermission;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() -> userRepository.findByEmail(usernameOrEmail)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail)));

        List<GrantedAuthority> authorities = new ArrayList<>();

        Role role = user.getRole();
        if (role != null) {
            // Thêm role vào authorities với tiền tố "ROLE_"
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoleName()));
            // Thêm permissions từ RolePermission
            authorities.addAll(role.getRolePermissions().stream()
                    .map(RolePermission::getPermissionName)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList()));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                authorities
        );
    }
}