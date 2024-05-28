import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import products from '@/assets/data/products';
import { defaultPizzaImage } from '@/src/components/ProductListItem';


const sizes = ['S', 'M', 'L', 'XL']

const ProductDetailsScreen= () => {
    const { id } = useLocalSearchParams();

    const product = products.find((p) => p.id.toString() === id);
    
    if (!product) {
        return <Text>Product not found.</Text>
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: product?.name}} />
            <Image source={{ uri: product.image || defaultPizzaImage}} style={styles.image}/>

            <Text>Select size</Text>
            {sizes.map((size) => 
                <Text>{size}</Text>)
            }

            <Text style={styles.price}>R{product.price}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        padding: 10
    },
    image: {
        width: '100%',
        aspectRatio: 1,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
    }
})

export default ProductDetailsScreen;