from app.storage.memory_store import store


def test_offers_catalog_exists():
    offers = store.get_offers_for_user(user_points=50)
    assert len(offers) >= 5
    assert any(o.brand == "Reewild Essentials" for o in offers)
    assert any(o.brand == "Patagonia" for o in offers)


def test_offer_redeemability_status():
    # With 60 points, 50-pt offer should be redeemable, 100-pt offer should be locked
    offers = store.get_offers_for_user(user_points=60)
    offer_50 = next(o for o in offers if o.required_points == 50)
    offer_100 = next(o for o in offers if o.required_points == 100)

    assert offer_50.is_redeemable is True
    assert offer_50.points_needed == 0

    assert offer_100.is_redeemable is False
    assert offer_100.points_needed == 40


def test_redeem_offer_workflow():
    user_id = "redemption_test_user"
    store.sync_user_wallet_points(120, user_id=user_id)

    # 1. Redeem 50-pt offer
    success, offer, msg, remaining = store.redeem_offer(
        offer_id="OFFER-REEWILD-15",
        user_id=user_id,
    )
    assert success is True
    assert offer is not None
    assert remaining == 70  # 120 - 50
    assert offer.promo_code == "REEWILD-GREEN15"

    # 2. Try redeeming 100-pt offer with only 70 points remaining (should fail)
    success_2, _, msg_2, remaining_2 = store.redeem_offer(
        offer_id="OFFER-PATAGONIA-20",
        user_id=user_id,
    )
    assert success_2 is False
    assert "Insufficient points" in msg_2
    assert remaining_2 == 70

    # 3. Re-redeeming already redeemed offer returns code safely
    success_3, offer_3, msg_3, remaining_3 = store.redeem_offer(
        offer_id="OFFER-REEWILD-15",
        user_id=user_id,
    )
    assert success_3 is True
    assert remaining_3 == 70
