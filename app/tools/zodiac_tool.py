ZODIAC_SIGNS = [
    ("Aries", 3, 21, 4, 19),
    ("Taurus", 4, 20, 5, 20),
    ("Gemini", 5, 21, 6, 20),
    ("Cancer", 6, 21, 7, 22),
    ("Leo", 7, 23, 8, 22),
    ("Virgo", 8, 23, 9, 22),
    ("Libra", 9, 23, 10, 22),
    ("Scorpio", 10, 23, 11, 21),
    ("Sagittarius", 11, 22, 12, 21),
    ("Capricorn", 12, 22, 1, 19),
    ("Aquarius", 1, 20, 2, 18),
    ("Pisces", 2, 19, 3, 20),
]


def calculate_zodiac(
    month: int,
    day: int
) -> str:

    for (
        sign,
        start_month,
        start_day,
        end_month,
        end_day
    ) in ZODIAC_SIGNS:

        if start_month == end_month:

            if (
                month == start_month
                and start_day <= day <= end_day
            ):
                return sign

        else:

            if (
                month == start_month
                and day >= start_day
            ) or (
                month == end_month
                and day <= end_day
            ):
                return sign

    return "Unknown"
