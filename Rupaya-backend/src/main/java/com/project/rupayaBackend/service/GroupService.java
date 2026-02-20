package com.project.rupayaBackend.service;

import com.project.rupayaBackend.dto.*;
import com.project.rupayaBackend.entity.Group;
import com.project.rupayaBackend.entity.GroupMember;
import com.project.rupayaBackend.entity.User;
import com.project.rupayaBackend.entity.enums.GroupRole;
import com.project.rupayaBackend.exception.NotFoundException;
import com.project.rupayaBackend.repository.GroupMemberRepository;
import com.project.rupayaBackend.repository.GroupRepository;
import com.project.rupayaBackend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupMemberRepository groupMemberRepository;

    Logger logger = LoggerFactory.getLogger(GroupService.class);

    public GroupResponse createGroup(GroupCreationRequest request, UUID creatorId) {
        if(request.getInitial_members() == null || request.getInitial_members().isEmpty()){
            throw new IllegalArgumentException("Initial members cannot be empty");
        }

        User creator =  userRepository.findById(creatorId).orElseThrow(() -> new NotFoundException("User not found"));
        //create group
        Group group = Group.builder().name(request.getName()).description(request.getDescription()).build();
        group.setCreatedBy(creatorId);
        groupRepository.save(group);

        //add creator as admin
        GroupMember creatorMember = GroupMember.builder().groupId(group.getId()).userId(creatorId).role(GroupRole.ADMIN).build();
        creatorMember.setCreatedBy(creatorId);
        groupMemberRepository.save(creatorMember);

        // Add initial members (skip self, skip invalid emails)
        // Spec: if none added (besides creator) -> rollback + ValidationError
        Set<String> emails = request.getInitial_members().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        // Remove creator email if present
        emails.remove(creator.getEmail().toLowerCase());

        int addedCount = 0;
        for (String email : emails) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) continue; // FastAPI: it "find user, add if exists" (you can change to error if you want)
            User u = userOpt.get();

            // prevent duplicates by constraint (user_id, group_id)
            // you can also check exists before save
            if (groupMemberRepository.existsActiveByGroupIdAndUserId(group.getId(), u.getId())) {
                continue;
            }

            GroupMember member = GroupMember.builder()
                    .groupId(group.getId())
                    .userId(u.getId())
                    .role(GroupRole.MEMBER)
                    .build();
            member.setCreatedBy(creatorId);
            groupMemberRepository.save(member);
            addedCount++;
        }

        if (addedCount == 0) {
            // No other members could be added -> rollback
            // If you have a custom ValidationException, throw that.
            throw new IllegalArgumentException("At least one valid member (other than yourself) must be added");
        }

        long memberCount = groupMemberRepository.countActiveMembers(group.getId());

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .created_by(group.getCreatedBy())
                .created_at(group.getCreatedAt())
                .member_count(memberCount)
                .build();
    }

    public PaginatedResponse<GroupResponse> getAllGroupsOfUser(
            UUID userId,
            int skip,
            int limit
    ) {

        int page = skip / limit; // convert offset to page number

        Pageable pageable = PageRequest.of(page, limit);

        Page<Group> groupPage = groupRepository.findAllGroupsOfUser(userId, pageable);

        List<GroupResponse> items = groupPage.getContent().stream()
                .map(g -> GroupResponse.builder()
                        .id(g.getId())
                        .name(g.getName())
                        .description(g.getDescription())
                        .created_by(g.getCreatedBy())
                        .created_at(g.getCreatedAt())
                        .member_count(groupMemberRepository.countByGroupId(g.getId()))
                        .total_owed(0.0)
                        .total_owe(0.0)
                        .build())
                .toList();

        return PaginatedResponse.<GroupResponse>builder()
                .items(items)
                .total(groupPage.getTotalElements())
                .skip(skip)
                .limit(limit)
                .hasMore(groupPage.hasNext())
                .build();
    }

    public GroupDetailResponse getGroupDetail(UUID groupId, UUID currentUserId) {

        // 1) Ensure group exists
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        // 2) Ensure current user is member (FastAPI spec)
        boolean isMember = groupMemberRepository.existsActiveByGroupIdAndUserId(groupId, currentUserId);
        if (!isMember) {
            // ideally throw ForbiddenException -> 403
            throw new SecurityException("Not a member of this group");
        }

        // 3) Fetch members
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);

        // 4) Fetch user details for those members
        List<UUID> memberUserIds = members.stream()
                .map(GroupMember::getUserId)
                .distinct()
                .toList();

        Map<UUID, User> userMap = userRepository.findByIdIn(memberUserIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // 5) Build members response
        List<GroupMembersResponse> memberResponses = members.stream()
                .map(m -> {
                    User u = userMap.get(m.getUserId());
                    UserResponse userDto = (u == null) ? null : UserResponse.builder()
                            .id(u.getId())
                            .name(u.getName())
                            .email(u.getEmail())
                            .role(u.getRole())
                            .build();

                    return GroupMembersResponse.builder()
                            .id(m.getId())
                            .user(userDto)
                            .role(m.getRole().name())
                            .createdAt(m.getCreatedAt())
                            .build();
                })
                .toList();

        return GroupDetailResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .created_by(group.getCreatedBy())
                .created_at(group.getCreatedAt())
                .member_count(memberResponses.size())
                .total_owed(0.0)
                .total_owe(0.0)
                .members(memberResponses)
                .build();
    }

    public GroupMembersResponse addMemberToGroup(UUID groupId, UUID loggedInUserId, AddMemberRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found")); //

        boolean isAdmin = groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, loggedInUserId,GroupRole.ADMIN);
        if(!isAdmin){
            throw new SecurityException("Not Admin, can't perform action"); //403
        }

        if(request.getEmail() == null || request.getEmail().trim().isEmpty()){
            throw new IllegalArgumentException("Email is required"); //400
        }

        User userToAdd = userRepository.findByEmail(request.getEmail().trim()).orElseThrow(()-> new NotFoundException("User not found with email"+ request.getEmail()));
        boolean isMember = groupMemberRepository.existsActiveByGroupIdAndUserId(groupId,userToAdd.getId());
        if(isMember) {
            throw new IllegalArgumentException("member of this group already"); //400
        }
        UserResponse response = UserResponse.builder().id(userToAdd.getId()).name(userToAdd.getName()).email(userToAdd.getEmail()).role(userToAdd.getRole()).build();

        GroupMember member = GroupMember.builder().userId(userToAdd.getId()).groupId(groupId).role(GroupRole.MEMBER).build();
        member.setCreatedBy(loggedInUserId);
        groupMemberRepository.save(member);

        GroupMembersResponse groupMembersResponse = GroupMembersResponse.builder().id(member.getId()).user(response).role(member.getRole().name()).createdAt(member.getCreatedAt()).build();
        return groupMembersResponse;
    }

    public GroupMembersResponse makeMemberToAdmin(UUID groupId, UUID memberId, AddMemberRequest request, UUID loggedInUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        boolean isAdmin = groupMemberRepository.existsByGroupIdAndUserIdAndRole(groupId, loggedInUserId,GroupRole.ADMIN);
        if(!isAdmin){
            throw new SecurityException("Not Admin, can't perform action");
        }

        GroupMember gm = groupMemberRepository.findByIdAndGroupId(memberId,groupId).orElseThrow(()-> new NotFoundException("Member not found with id"+ memberId));

        if(gm.getRole().equals(GroupRole.MEMBER)){
            gm.setRole(GroupRole.ADMIN);
        }else{
            gm.setRole(GroupRole.MEMBER);
        }
        gm.setCreatedBy(loggedInUserId);
        GroupMember saved = groupMemberRepository.save(gm);

        UUID userId = saved.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id " + userId));
        UserResponse userResponse = (userId == null) ? null : UserResponse.builder().id(userId).name(user.getName()).email(user.getEmail()).role(user.getRole()).build();
        return GroupMembersResponse.builder().id(saved.getId()).user(userResponse).role(saved.getRole().name()).createdAt(saved.getCreatedAt()).build();
    }
}


