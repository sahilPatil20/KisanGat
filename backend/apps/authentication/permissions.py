from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthenticatedStaffOrReadOnly(BasePermission):
    """Allow authenticated reads, but restrict data changes to staff users."""

    message = 'Staff access is required to modify this resource.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.method in SAFE_METHODS or request.user.is_staff
