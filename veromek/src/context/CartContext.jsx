import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "veromek-cart";

function normalizeStock(value) {
  const stock = Number(value);

  if (
    !Number.isFinite(stock) ||
    stock < 0
  ) {
    return 0;
  }

  return Math.floor(stock);
}

function normalizeQuantity(value) {
  const quantity = Number(value);

  if (
    !Number.isFinite(quantity) ||
    quantity < 1
  ) {
    return 1;
  }

  return Math.floor(quantity);
}

function normalizeCartItem(item) {
  const stock = normalizeStock(item.stock);
  const quantity = normalizeQuantity(
    item.quantity
  );

  return {
    ...item,
    price: Number(item.price || 0),
    stock,
    quantity: Math.min(quantity, stock),
  };
}

function loadStoredCart() {
  try {
    const savedCart = localStorage.getItem(
      CART_STORAGE_KEY
    );

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart
      .map(normalizeCartItem)
      .filter(
        (item) =>
          item.quantity > 0 &&
          item.stock > 0
      );
  } catch (error) {
    console.error(
      "Failed to load cart:",
      error
    );

    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(
    loadStoredCart
  );

  const cartRef = useRef(cart);

  const updateCart = useCallback(
    (nextCartOrUpdater) => {
      const nextCart =
        typeof nextCartOrUpdater ===
        "function"
          ? nextCartOrUpdater(
              cartRef.current
            )
          : nextCartOrUpdater;

      cartRef.current = nextCart;
      setCart(nextCart);

      return nextCart;
    },
    []
  );

  useEffect(() => {
    cartRef.current = cart;

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [cart]);

  const addToCart = useCallback(
    (
      product,
      requestedQuantity = 1
    ) => {
      if (!product?.id) {
        toast.error(
          "Invalid product."
        );

        return false;
      }

      const productStock =
        normalizeStock(product.stock);

      const quantityToAdd =
        normalizeQuantity(
          requestedQuantity
        );

      if (
        product.active === false ||
        productStock <= 0
      ) {
        toast.error(
          `${product.name} is out of stock.`
        );

        return false;
      }

      const currentCart =
        cartRef.current;

      const existingProduct =
        currentCart.find(
          (item) =>
            String(item.id) ===
            String(product.id)
        );

      const currentQuantity =
        existingProduct
          ? Number(
              existingProduct.quantity ||
                0
            )
          : 0;

      const nextQuantity =
        currentQuantity +
        quantityToAdd;

      if (
        nextQuantity > productStock
      ) {
        const remainingQuantity =
          Math.max(
            productStock -
              currentQuantity,
            0
          );

        if (remainingQuantity === 0) {
          toast.error(
            `Maximum quantity reached. Only ${productStock} item(s) are available for ${product.name}.`
          );
        } else {
          toast.error(
            `You can add only ${remainingQuantity} more item(s) of ${product.name}.`
          );
        }

        return false;
      }

      let nextCart;

      if (existingProduct) {
        nextCart = currentCart.map(
          (item) =>
            String(item.id) ===
            String(product.id)
              ? {
                  ...item,
                  ...product,
                  price: Number(
                    product.price || 0
                  ),
                  stock:
                    productStock,
                  quantity:
                    nextQuantity,
                }
              : item
        );

        updateCart(nextCart);

        toast.success(
          `${product.name} quantity updated: ${nextQuantity}/${productStock}.`
        );

        return true;
      }

      nextCart = [
        ...currentCart,
        {
          ...product,
          price: Number(
            product.price || 0
          ),
          stock: productStock,
          quantity: quantityToAdd,
        },
      ];

      updateCart(nextCart);

      toast.success(
        `${product.name} added to cart.`
      );

      return true;
    },
    [updateCart]
  );

  const increaseQuantity =
    useCallback(
      (id) => {
        const currentCart =
          cartRef.current;

        const selectedItem =
          currentCart.find(
            (item) =>
              String(item.id) ===
              String(id)
          );

        if (!selectedItem) {
          return false;
        }

        const stock =
          normalizeStock(
            selectedItem.stock
          );

        const currentQuantity =
          Number(
            selectedItem.quantity ||
              0
          );

        if (
          selectedItem.active ===
            false ||
          stock <= 0
        ) {
          toast.error(
            `${selectedItem.name} is out of stock.`
          );

          return false;
        }

        if (
          currentQuantity >= stock
        ) {
          toast.error(
            `Maximum quantity reached. Only ${stock} item(s) are available for ${selectedItem.name}.`
          );

          return false;
        }

        const nextQuantity =
          currentQuantity + 1;

        updateCart(
          currentCart.map((item) =>
            String(item.id) ===
            String(id)
              ? {
                  ...item,
                  quantity:
                    nextQuantity,
                }
              : item
          )
        );

        return true;
      },
      [updateCart]
    );

  const decreaseQuantity =
    useCallback(
      (id) => {
        const currentCart =
          cartRef.current;

        const selectedItem =
          currentCart.find(
            (item) =>
              String(item.id) ===
              String(id)
          );

        if (!selectedItem) {
          return false;
        }

        const nextQuantity =
          Number(
            selectedItem.quantity ||
              0
          ) - 1;

        if (nextQuantity <= 0) {
          updateCart(
            currentCart.filter(
              (item) =>
                String(item.id) !==
                String(id)
            )
          );

          toast.success(
            `${selectedItem.name} removed from cart.`
          );

          return true;
        }

        updateCart(
          currentCart.map((item) =>
            String(item.id) ===
            String(id)
              ? {
                  ...item,
                  quantity:
                    nextQuantity,
                }
              : item
          )
        );

        return true;
      },
      [updateCart]
    );

  const removeFromCart =
    useCallback(
      (id) => {
        const currentCart =
          cartRef.current;

        const selectedItem =
          currentCart.find(
            (item) =>
              String(item.id) ===
              String(id)
          );

        if (!selectedItem) {
          return false;
        }

        updateCart(
          currentCart.filter(
            (item) =>
              String(item.id) !==
              String(id)
          )
        );

        toast.success(
          `${selectedItem.name} removed from cart.`
        );

        return true;
      },
      [updateCart]
    );

  const clearCart = useCallback(() => {
    cartRef.current = [];
    setCart([]);

    localStorage.removeItem(
      CART_STORAGE_KEY
    );
  }, []);

  const syncCartStock = useCallback(
    (products) => {
      const productsMap = new Map(
        (products ?? []).map(
          (product) => [
            String(product.id),
            product,
          ]
        )
      );

      const currentCart =
        cartRef.current;

      const nextCart = currentCart
        .map((item) => {
          const databaseProduct =
            productsMap.get(
              String(item.id)
            );

          if (!databaseProduct) {
            return {
              ...item,
              stock: 0,
              active: false,
              quantity: 0,
            };
          }

          const currentStock =
            normalizeStock(
              databaseProduct.stock
            );

          const currentQuantity =
            Number(
              item.quantity || 0
            );

          const safeQuantity =
            Math.min(
              currentQuantity,
              currentStock
            );

          return {
            ...item,
            ...databaseProduct,
            price: Number(
              databaseProduct.price ||
                0
            ),
            stock: currentStock,
            active:
              databaseProduct.active !==
              false,
            quantity: safeQuantity,
          };
        })
        .filter(
          (item) =>
            item.quantity > 0 &&
            item.stock > 0 &&
            item.active !== false
        );

      updateCart(nextCart);

      return nextCart;
    },
    [updateCart]
  );

  const getCartQuantity =
    useCallback((productId) => {
      const item =
        cartRef.current.find(
          (cartItem) =>
            String(cartItem.id) ===
            String(productId)
        );

      return Number(
        item?.quantity || 0
      );
    }, []);

  const canAddToCart =
    useCallback(
      (
        product,
        requestedQuantity = 1
      ) => {
        const stock =
          normalizeStock(
            product?.stock
          );

        if (
          !product?.id ||
          product.active === false ||
          stock <= 0
        ) {
          return false;
        }

        const currentQuantity =
          getCartQuantity(
            product.id
          );

        return (
          currentQuantity +
            normalizeQuantity(
              requestedQuantity
            ) <=
          stock
        );
      },
      [getCartQuantity]
    );

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      ),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(
              item.quantity || 0
            ),
        0
      ),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        subtotal,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        syncCartStock,
        getCartQuantity,
        canAddToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(
    CartContext
  );

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider."
    );
  }

  return context;
}