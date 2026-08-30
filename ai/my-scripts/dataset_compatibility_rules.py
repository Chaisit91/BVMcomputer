"""Pure compatibility-label helpers shared by dataset builders."""


def required_with_optional_constraint(required_match, optional_match):
    """Combine a required rule with an optional rule.

    ``optional_match`` may be -1/None when the source data is unknown. Unknown
    optional data must not turn a valid required match into an incompatibility.
    """

    if required_match not in (0, 1):
        return None
    if optional_match == 0:
        return 0
    return required_match
